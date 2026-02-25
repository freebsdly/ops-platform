import { Injectable, inject, DestroyRef } from '@angular/core';
import { Observable, of, map, tap, finalize, catchError, switchMap } from 'rxjs';
import { UserApiService } from './user-api.service';

interface CacheEntry {
  value: boolean;
  timestamp: number;
}

@Injectable({ providedIn: 'root' })
export class PermissionCacheService {
  private userApiService = inject(UserApiService);
  private destroyRef = inject(DestroyRef);

  // 权限检查缓存（仅内存缓存，TTL 1分钟）
  private permissionsCache = new Map<string, CacheEntry>();
  private readonly CACHE_TTL = 1 * 60 * 1000; // 1分钟 - 短期缓存

  // 进行中的请求（去重）
  private pendingChecks = new Map<string, Observable<boolean>>();

  // 多标签页同步
  private broadcastChannel: BroadcastChannel | null = null;

  constructor() {
    this.initBroadcastChannel();
  }

  ngOnDestroy() {
    if (this.broadcastChannel) {
      this.broadcastChannel.close();
    }
  }

  /**
   * 初始化 BroadcastChannel
   */
  private initBroadcastChannel() {
    if (typeof BroadcastChannel !== 'undefined') {
      this.broadcastChannel = new BroadcastChannel('permission-cache-sync');
      this.broadcastChannel.onmessage = (event) => {
        if (event.data.type === 'invalidate') {
          this.invalidateCache(event.data.keys);
        }
      };
    }
  }

  /**
   * 单个权限检查（带短期内存缓存）
   * @param resource 资源
   * @param action 操作
   * @returns Observable<boolean>
   */
  checkPermissionWithCache(
    resource: string,
    action: string
  ): Observable<boolean> {
    const cacheKey = `${resource}:${action}`;

    // 检查缓存
    const cached = this.getFromCache(cacheKey);
    if (cached !== null) {
      return of(cached);
    }

    // 检查是否有进行中的请求
    if (this.pendingChecks.has(cacheKey)) {
      return this.pendingChecks.get(cacheKey)!;
    }

    // 发起新请求
    const request$ = this.performPermissionCheck(resource, action, cacheKey);
    this.pendingChecks.set(cacheKey, request$);

    return request$.pipe(
      finalize(() => this.pendingChecks.delete(cacheKey))
    );
  }

  /**
   * 批量权限检查（优化）
   * @param checks 权限检查数组
   * @returns Observable<Map<string, boolean>>
   */
  checkPermissionsBatch(
    checks: Array<{ resource: string; action: string }>
  ): Observable<Map<string, boolean>> {
    const results = new Map<string, boolean>();
    const uncachedChecks: Array<{ resource: string; action: string; key: string }> = [];

    // 先查缓存
    checks.forEach(({ resource, action }) => {
      const key = `${resource}:${action}`;
      const cached = this.getFromCache(key);

      if (cached !== null) {
        results.set(key, cached);
      } else {
        uncachedChecks.push({ resource, action, key });
      }
    });

    // 批量API调用
    if (uncachedChecks.length > 0) {
      return this.performBatchCheck(uncachedChecks).pipe(
        map(batchResults => {
          batchResults.forEach((value, key) => {
            results.set(key, value);
          });
          return results;
        })
      );
    }

    return of(results);
  }

  /**
   * 从缓存获取
   * @param key 缓存键
   * @returns 缓存值或null
   */
  private getFromCache(key: string): boolean | null {
    const cached = this.permissionsCache.get(key);
    if (!cached) return null;

    // 检查是否过期
    if (Date.now() - cached.timestamp > this.CACHE_TTL) {
      this.permissionsCache.delete(key);
      return null;
    }

    return cached.value;
  }

  /**
   * 执行权限检查（始终调用后端）
   * @param resource 资源
   * @param action 操作
   * @param cacheKey 缓存键
   * @returns Observable<boolean>
   */
  private performPermissionCheck(
    resource: string,
    action: string,
    cacheKey: string
  ): Observable<boolean> {
    // 始终从后端获取权限，后端是唯一来源
    return this.userApiService.checkRoutePermission(
      `${resource}/${action}`,
      undefined
    ).pipe(
      map(response => response.hasPermission),
      tap(hasPermission => {
        // 更新短期内存缓存
        this.permissionsCache.set(cacheKey, {
          value: hasPermission,
          timestamp: Date.now()
        });
      }),
      catchError(() => of(false)) // 失败时返回 false，不暴露错误
    );
  }

  /**
   * 执行批量检查
   * @param checks 未缓存的检查
   * @returns Observable<Map<string, boolean>>
   */
  private performBatchCheck(
    checks: Array<{ resource: string; action: string; key: string }>
  ): Observable<Map<string, boolean>> {
    return this.userApiService.checkBatchRoutePermissions(
      checks.map(c => `${c.resource}/${c.action}`)
    ).pipe(
      map(response => {
        const results = new Map<string, boolean>();
        response.results.forEach(result => {
          const check = checks.find(c => c.key === result.routePath);
          if (check) {
            results.set(check.key, result.hasPermission);
            // 更新缓存
            this.permissionsCache.set(check.key, {
              value: result.hasPermission,
              timestamp: Date.now()
            });
          }
        });
        return results;
      }),
      catchError(() => of(new Map())) // 失败时返回空 Map
    );
  }

  /**
   * 清除缓存
   */
  clearCache(): void {
    this.permissionsCache.clear();
    this.notifyCacheInvalidation();
  }

  /**
   * 使特定缓存失效
   * @param keys 要失效的缓存键
   */
  invalidateCache(keys?: string[]): void {
    if (keys) {
      keys.forEach(key => this.permissionsCache.delete(key));
    } else {
      this.permissionsCache.clear();
    }
  }

  /**
   * 通知其他标签页缓存失效
   * @param keys 要失效的缓存键
   */
  private notifyCacheInvalidation(keys?: string[]) {
    if (this.broadcastChannel) {
      this.broadcastChannel.postMessage({
        type: 'invalidate',
        keys
      });
    }
  }

  /**
   * 获取缓存统计信息（用于调试）
   * @returns 缓存统计
   */
  getCacheStats() {
    const now = Date.now();
    let validCount = 0;
    let expiredCount = 0;

    this.permissionsCache.forEach((entry) => {
      if (now - entry.timestamp > this.CACHE_TTL) {
        expiredCount++;
      } else {
        validCount++;
      }
    });

    return {
      total: this.permissionsCache.size,
      valid: validCount,
      expired: expiredCount,
      ttl: this.CACHE_TTL,
      pending: this.pendingChecks.size
    };
  }
}
