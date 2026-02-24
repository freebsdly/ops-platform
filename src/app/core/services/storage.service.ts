/**
 * 存储类型枚举
 */
export enum StorageType {
  LOCAL = 'localStorage',
  SESSION = 'sessionStorage',
  MEMORY = 'memory'
}

/**
 * 存储选项
 */
export interface StorageOptions {
  type?: StorageType;
  encrypted?: boolean;
  ttl?: number; // Time to live in milliseconds
  version?: number;
}

/**
 * 存储数据包装器
 */
interface StorageData<T> {
  value: T;
  timestamp: number;
  ttl?: number;
  version?: number;
}

/**
 * 内存存储项
 */
interface MemoryStorageItem<T> {
  data: StorageData<T>;
  expireAt?: number;
}

/**
 * StorageService - 统一存储抽象层
 *
 * 提供类型安全的存储API，支持多种存储策略
 */
export class StorageService {
  private memoryStorage = new Map<string, MemoryStorageItem<unknown>>();
  private readonly DEFAULT_TTL = 7 * 24 * 60 * 60 * 1000; // 7天默认TTL

  /**
   * 存储数据
   *
   * @param key 存储键
   * @param value 存储值
   * @param options 存储选项
   */
  setItem<T>(key: string, value: T, options: StorageOptions = {}): void {
    const storageType = options.type ?? StorageType.LOCAL;

    switch (storageType) {
      case StorageType.LOCAL:
        this.setToLocalStorage(key, value, options);
        break;
      case StorageType.SESSION:
        this.setToSessionStorage(key, value, options);
        break;
      case StorageType.MEMORY:
        this.setToMemory(key, value, options);
        break;
      default:
        console.warn(`[StorageService] Unknown storage type: ${storageType}, falling back to localStorage`);
        this.setToLocalStorage(key, value, options);
    }
  }

  /**
   * 获取数据
   *
   * @param key 存储键
   * @param options 存储选项
   * @returns 存储值，如果不存在或过期返回null
   */
  getItem<T>(key: string, options: StorageOptions = {}): T | null {
    const storageType = options.type ?? StorageType.LOCAL;

    switch (storageType) {
      case StorageType.LOCAL:
        return this.getFromLocalStorage<T>(key, options);
      case StorageType.SESSION:
        return this.getFromSessionStorage<T>(key, options);
      case StorageType.MEMORY:
        return this.getFromMemory<T>(key, options);
      default:
        console.warn(`[StorageService] Unknown storage type: ${storageType}, falling back to localStorage`);
        return this.getFromLocalStorage<T>(key, options);
    }
  }

  /**
   * 移除数据
   *
   * @param key 存储键
   * @param type 存储类型
   */
  removeItem(key: string, type: StorageType = StorageType.LOCAL): void {
    switch (type) {
      case StorageType.LOCAL:
        localStorage.removeItem(key);
        break;
      case StorageType.SESSION:
        sessionStorage.removeItem(key);
        break;
      case StorageType.MEMORY:
        this.memoryStorage.delete(key);
        break;
      default:
        console.warn(`[StorageService] Unknown storage type: ${type}`);
    }
  }

  /**
   * 清空指定类型的存储
   *
   * @param type 存储类型
   */
  clear(type: StorageType = StorageType.LOCAL): void {
    switch (type) {
      case StorageType.LOCAL:
        localStorage.clear();
        break;
      case StorageType.SESSION:
        sessionStorage.clear();
        break;
      case StorageType.MEMORY:
        this.memoryStorage.clear();
        break;
      default:
        console.warn(`[StorageService] Unknown storage type: ${type}`);
    }
  }

  /**
   * 检查数据是否存在
   *
   * @param key 存储键
   * @param options 存储选项
   * @returns 是否存在且未过期
   */
  hasItem(key: string, options: StorageOptions = {}): boolean {
    return this.getItem(key, options) !== null;
  }

  /**
   * 获取存储大小（字节）
   *
   * @param type 存储类型
   * @returns 存储大小
   */
  getStorageSize(type: StorageType = StorageType.LOCAL): number {
    let size = 0;

    switch (type) {
      case StorageType.LOCAL:
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key) {
            size += (key.length + localStorage.getItem(key)?.length || 0) * 2; // UTF-16 chars are 2 bytes
          }
        }
        break;
      case StorageType.SESSION:
        for (let i = 0; i < sessionStorage.length; i++) {
          const key = sessionStorage.key(i);
          if (key) {
            size += (key.length + sessionStorage.getItem(key)?.length || 0) * 2;
          }
        }
        break;
      case StorageType.MEMORY:
        // Memory storage doesn't have a meaningful size in bytes
        size = this.memoryStorage.size;
        break;
      default:
        console.warn(`[StorageService] Unknown storage type: ${type}`);
    }

    return size;
  }

  /**
   * 获取剩余空间估计（仅localStorage/sessionStorage）
   *
   * @param type 存储类型
   * @returns 剩余空间（字节），内存存储返回Infinity
   */
  getRemainingSpace(type: StorageType = StorageType.LOCAL): number {
    if (type === StorageType.MEMORY) {
      return Infinity;
    }

    // localStorage/sessionStorage typically have 5MB limit
    const MAX_SIZE = 5 * 1024 * 1024; // 5MB
    const currentSize = this.getStorageSize(type);
    return Math.max(0, MAX_SIZE - currentSize);
  }

  /**
   * 清理过期数据
   *
   * @param type 存储类型
   * @returns 清理的数据数量
   */
  cleanExpired(type: StorageType = StorageType.MEMORY): number {
    if (type !== StorageType.MEMORY) {
      // localStorage/sessionStorage don't have automatic TTL
      return 0;
    }

    let cleanedCount = 0;
    const now = Date.now();

    for (const [key, item] of this.memoryStorage.entries()) {
      if (item.expireAt && item.expireAt <= now) {
        this.memoryStorage.delete(key);
        cleanedCount++;
      }
    }

    return cleanedCount;
  }

  // ========== 私有方法 ==========

  /**
   * 存储到localStorage
   */
  private setToLocalStorage<T>(key: string, value: T, options: StorageOptions): void {
    try {
      const wrappedData: StorageData<T> = {
        value,
        timestamp: Date.now(),
        ttl: options.ttl,
        version: options.version
      };

      const serialized = JSON.stringify(wrappedData);
      localStorage.setItem(key, serialized);
    } catch (error) {
      console.error(`[StorageService] Failed to set item in localStorage: ${key}`, error);
      if (this.isQuotaExceededError(error)) {
        this.freeSpaceInLocalStorage();
        try {
          const wrappedData: StorageData<T> = {
            value,
            timestamp: Date.now(),
            ttl: options.ttl,
            version: options.version
          };
          localStorage.setItem(key, JSON.stringify(wrappedData));
        } catch (retryError) {
          console.error('[StorageService] Retry failed', retryError);
        }
      }
    }
  }

  /**
   * 存储到sessionStorage
   */
  private setToSessionStorage<T>(key: string, value: T, options: StorageOptions): void {
    try {
      const wrappedData: StorageData<T> = {
        value,
        timestamp: Date.now(),
        ttl: options.ttl,
        version: options.version
      };

      const serialized = JSON.stringify(wrappedData);
      sessionStorage.setItem(key, serialized);
    } catch (error) {
      console.error(`[StorageService] Failed to set item in sessionStorage: ${key}`, error);
    }
  }

  /**
   * 存储到内存
   */
  private setToMemory<T>(key: string, value: T, options: StorageOptions): void {
    const ttl = options.ttl ?? this.DEFAULT_TTL;
    const wrappedData: StorageData<T> = {
      value,
      timestamp: Date.now(),
      ttl,
      version: options.version
    };

    this.memoryStorage.set(key, {
      data: wrappedData,
      expireAt: ttl ? Date.now() + ttl : undefined
    });
  }

  /**
   * 从localStorage获取
   */
  private getFromLocalStorage<T>(key: string, options: StorageOptions): T | null {
    try {
      const serialized = localStorage.getItem(key);
      if (!serialized) {
        return null;
      }

      const wrappedData = JSON.parse(serialized) as StorageData<T>;

      if (this.isExpired(wrappedData)) {
        localStorage.removeItem(key);
        return null;
      }

      if (options.version !== undefined && wrappedData.version !== options.version) {
        console.warn(`[StorageService] Version mismatch for key: ${key}`);
        return null;
      }

      return wrappedData.value;
    } catch (error) {
      console.error(`[StorageService] Failed to get item from localStorage: ${key}`, error);
      return null;
    }
  }

  /**
   * 从sessionStorage获取
   */
  private getFromSessionStorage<T>(key: string, options: StorageOptions): T | null {
    try {
      const serialized = sessionStorage.getItem(key);
      if (!serialized) {
        return null;
      }

      const wrappedData = JSON.parse(serialized) as StorageData<T>;

      if (this.isExpired(wrappedData)) {
        sessionStorage.removeItem(key);
        return null;
      }

      if (options.version !== undefined && wrappedData.version !== options.version) {
        console.warn(`[StorageService) Version mismatch for key: ${key}`);
        return null;
      }

      return wrappedData.value;
    } catch (error) {
      console.error(`[StorageService] Failed to get item from sessionStorage: ${key}`, error);
      return null;
    }
  }

  /**
   * 从内存获取
   */
  private getFromMemory<T>(key: string, options: StorageOptions): T | null {
    const item = this.memoryStorage.get(key);

    if (!item) {
      return null;
    }

    // 检查是否过期
    if (item.expireAt && item.expireAt <= Date.now()) {
      this.memoryStorage.delete(key);
      return null;
    }

    // 检查版本
    if (options.version !== undefined && item.data.version !== options.version) {
      console.warn(`[StorageService] Version mismatch for key: ${key}`);
      return null;
    }

    return item.data.value as T;
  }

  /**
   * 检查数据是否过期
   */
  private isExpired<T>(data: StorageData<T>): boolean {
    if (!data.ttl) {
      return false;
    }

    const elapsed = Date.now() - data.timestamp;
    return elapsed > data.ttl;
  }

  /**
   * 检查是否为配额超限错误
   */
  private isQuotaExceededError(error: any): boolean {
    return (
      error instanceof DOMException &&
      (error.name === 'QuotaExceededError' ||
       error.name === 'NS_ERROR_DOM_QUOTA_REACHED')
    );
  }

  /**
   * 在localStorage中释放空间
   */
  private freeSpaceInLocalStorage(): void {
    console.warn('[StorageService] localStorage quota exceeded, attempting to free space');

    const keys: Array<{ key: string; timestamp: number }> = [];

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key) {
        try {
          const serialized = localStorage.getItem(key);
          if (serialized) {
            const data = JSON.parse(serialized) as StorageData<unknown>;
            keys.push({ key, timestamp: data.timestamp || 0 });
          }
        } catch {
          keys.push({ key, timestamp: 0 });
        }
      }
    }

    // 按时间戳排序，删除最旧的一半数据
    keys.sort((a, b) => a.timestamp - b.timestamp);

    const toDelete = Math.ceil(keys.length / 2);
    for (let i = 0; i < toDelete; i++) {
      localStorage.removeItem(keys[i].key);
    }

    console.log(`[StorageService] Freed space by removing ${toDelete} items from localStorage`);
  }
}

/**
 * 单例实例
 */
export const storageService = new StorageService();
