import { Injectable } from '@angular/core';
import { User } from '../types/user.interface';

/**
 * UserCacheService - 用户信息缓存服务
 *
 * 将用户信息缓存在内存中，并可选地备份到sessionStorage
 * sessionStorage 在标签页关闭时自动清除，比localStorage更安全
 */
@Injectable({
  providedIn: 'root'
})
export class UserCacheService {
  private cachedUser: User | null = null;
  private cacheTimestamp: number = 0;
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5分钟缓存
  private readonly STORAGE_KEY = 'secure_user_user';
  private readonly TIMESTAMP_KEY = 'secure_user_cache_timestamp';

  constructor() {
    console.log('[UserCacheService] Initialized');
    // 尝试从sessionStorage恢复用户数据
    this.loadFromSessionStorage();
  }

  /**
   * 缓存用户信息（存储在内存和sessionStorage中）
   *
   * @param user 用户对象
   */
  setUser(user: User): void {
    this.cachedUser = user;
    this.cacheTimestamp = Date.now();
    console.log('[UserCacheService] User cached in memory:', user.username);
    // 同步保存到sessionStorage作为备份
    this.saveToSessionStorage(user);
  }

  /**
   * 获取缓存的用户信息
   *
   * @returns 用户对象，如果缓存过期或不存在返回null
   */
  getUser(): User | null {
    // 优先返回内存中的用户数据
    if (this.cachedUser) {
      // 检查缓存是否过期
      if (Date.now() - this.cacheTimestamp > this.CACHE_DURATION) {
        console.warn('[UserCacheService] User cache expired');
        this.clear();
        return null;
      }
      return this.cachedUser;
    }

    // 内存中没有数据，尝试从sessionStorage恢复
    const restoredUser = this.loadFromSessionStorage();
    return restoredUser;
  }

  /**
   * 清除缓存（内存和sessionStorage）
   */
  clear(): void {
    if (this.cachedUser) {
      console.log('[UserCacheService] User cache cleared');
    }
    this.cachedUser = null;
    this.cacheTimestamp = 0;
    // 清除sessionStorage中的备份
    this.clearSessionStorage();
  }

  /**
   * 检查缓存是否有效
   *
   * @returns 是否有有效的用户缓存
   */
  isValid(): boolean {
    return this.getUser() !== null;
  }

  /**
   * 检查缓存是否存在
   *
   * @returns 是否有用户缓存（不管是否过期）
   */
  hasUser(): boolean {
    return this.cachedUser !== null;
  }

  /**
   * 检查缓存是否即将过期
   *
   * @param threshold 阈值（毫秒），默认1分钟
   * @returns 是否即将过期
   */
  isExpiringSoon(threshold: number = 60 * 1000): boolean {
    if (!this.cachedUser) {
      return false;
    }

    const timeLeft = this.CACHE_DURATION - (Date.now() - this.cacheTimestamp);
    return timeLeft > 0 && timeLeft <= threshold;
  }

  /**
   * 获取缓存剩余时间（毫秒）
   *
   * @returns 剩余时间，0表示已过期或不存在
   */
  getTimeToExpiry(): number {
    if (!this.cachedUser) {
      return 0;
    }

    const elapsed = Date.now() - this.cacheTimestamp;
    return Math.max(0, this.CACHE_DURATION - elapsed);
  }

  /**
   * 保存用户数据到sessionStorage
   * 使用简单的base64编码（非加密，但比明文安全）
   *
   * @param user 用户对象
   */
  private saveToSessionStorage(user: User): void {
    try {
      const encoded = btoa(JSON.stringify(user));
      sessionStorage.setItem(this.STORAGE_KEY, encoded);
      sessionStorage.setItem(this.TIMESTAMP_KEY, this.cacheTimestamp.toString());
      console.log('[UserCacheService] User cached to sessionStorage');
    } catch (error) {
      console.warn('[UserCacheService] Failed to save to sessionStorage:', error);
    }
  }

  /**
   * 从sessionStorage加载用户数据
   *
   * @returns 用户对象，如果不存在或过期返回null
   */
  private loadFromSessionStorage(): User | null {
    try {
      const encoded = sessionStorage.getItem(this.STORAGE_KEY);
      const timestamp = sessionStorage.getItem(this.TIMESTAMP_KEY);

      if (encoded && timestamp) {
        const decoded = atob(encoded);
        const user = JSON.parse(decoded);
        const cacheTime = parseInt(timestamp, 10);

        // 检查是否过期
        if (Date.now() - cacheTime > this.CACHE_DURATION) {
          console.warn('[UserCacheService] sessionStorage cache expired');
          this.clearSessionStorage();
          return null;
        }

        // 恢复到内存
        this.cachedUser = user;
        this.cacheTimestamp = cacheTime;
        console.log('[UserCacheService] User restored from sessionStorage:', user.username);
        return user;
      }
    } catch (error) {
      console.warn('[UserCacheService] Failed to load from sessionStorage:', error);
    }
    return null;
  }

  /**
   * 清除sessionStorage中的用户数据
   */
  private clearSessionStorage(): void {
    try {
      sessionStorage.removeItem(this.STORAGE_KEY);
      sessionStorage.removeItem(this.TIMESTAMP_KEY);
      console.log('[UserCacheService] sessionStorage cleared');
    } catch (error) {
      console.warn('[UserCacheService] Failed to clear sessionStorage:', error);
    }
  }
}
