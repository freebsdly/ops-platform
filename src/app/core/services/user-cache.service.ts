import { Injectable } from '@angular/core';
import { User } from '../types/user.interface';

/**
 * UserCacheService - 用户信息缓存服务
 *
 * 将用户信息缓存在内存中，不存储到localStorage
 * 避免用户敏感信息暴露在localStorage中
 */
@Injectable({
  providedIn: 'root'
})
export class UserCacheService {
  private cachedUser: User | null = null;
  private cacheTimestamp: number = 0;
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5分钟缓存

  constructor() {
    console.log('[UserCacheService] Initialized');
  }

  /**
   * 缓存用户信息（仅存储在内存中）
   *
   * @param user 用户对象
   */
  setUser(user: User): void {
    this.cachedUser = user;
    this.cacheTimestamp = Date.now();
    console.log('[UserCacheService] User cached in memory:', user.username);
  }

  /**
   * 获取缓存的用户信息
   *
   * @returns 用户对象，如果缓存过期或不存在返回null
   */
  getUser(): User | null {
    if (!this.cachedUser) {
      return null;
    }

    // 检查缓存是否过期
    if (Date.now() - this.cacheTimestamp > this.CACHE_DURATION) {
      console.warn('[UserCacheService] User cache expired');
      this.clear();
      return null;
    }

    return this.cachedUser;
  }

  /**
   * 清除缓存
   */
  clear(): void {
    if (this.cachedUser) {
      console.log('[UserCacheService] User cache cleared');
    }
    this.cachedUser = null;
    this.cacheTimestamp = 0;
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
}
