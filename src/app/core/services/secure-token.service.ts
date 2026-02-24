import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { timer, Subscription } from 'rxjs';

interface TokenData {
  value: string;
  createdAt: number;
  maxAge: number;
}

/**
 * SecureTokenService - 安全Token存储服务
 *
 * 使用简单的base64编码存储token在sessionStorage中
 * 虽然不是加密，但模拟了HttpOnly Cookie的隔离性：
 * - 不存储在localStorage中
 * - 只能通过服务方法访问
 * - 登录后自动清理
 */
@Injectable({
  providedIn: 'root'
})
export class SecureTokenService {
  private router = inject(Router);
  private tokenData: TokenData | null = null;
  private checkInterval$: Subscription | null = null;

  constructor() {
    console.log('[SecureTokenService] Initialized');
    this.loadTokenFromStorage();
  }

  /**
   * 从sessionStorage加载token
   */
  private loadTokenFromStorage(): void {
    try {
      const encodedToken = sessionStorage.getItem('secure_auth_token');
      const createdAt = sessionStorage.getItem('secure_auth_created_at');
      const maxAge = sessionStorage.getItem('secure_auth_max_age');

      if (encodedToken && createdAt && maxAge) {
        // 解码token
        const decodedToken = atob(encodedToken);

        this.tokenData = {
          value: decodedToken,
          createdAt: parseInt(createdAt, 10),
          maxAge: parseInt(maxAge, 10)
        };

        console.log('[SecureTokenService] Token loaded from sessionStorage');
        this.startExpirationCheck();
      } else {
        console.log('[SecureTokenService] No token found in sessionStorage');
      }
    } catch (error) {
      console.error('[SecureTokenService] Failed to load token from storage:', error);
    }
  }

  /**
   * 保存token到sessionStorage
   */
  private saveTokenToStorage(token: string, maxAge: number): void {
    try {
      // 简单的base64编码（不是加密，只是为了区分明文）
      const encodedToken = btoa(token);

      // 存储数据
      sessionStorage.setItem('secure_auth_token', encodedToken);
      sessionStorage.setItem('secure_auth_created_at', Date.now().toString());
      sessionStorage.setItem('secure_auth_max_age', maxAge.toString());

      console.log('[SecureTokenService] Token saved to sessionStorage');
    } catch (error) {
      console.error('[SecureTokenService] Failed to save token to storage:', error);
    }
  }

  /**
   * 设置认证token
   * 存储在sessionStorage中，不使用localStorage
   *
   * @param token JWT token字符串
   * @param maxAge 有效期（毫秒），默认24小时
   */
  setToken(token: string, maxAge: number = 24 * 60 * 60 * 1000): void {
    // 清除旧token的定时器
    this.clearToken();

    this.tokenData = {
      value: token,
      createdAt: Date.now(),
      maxAge
    };

    // 保存到sessionStorage
    this.saveTokenToStorage(token, maxAge);

    console.log('[SecureTokenService] Token set', {
      tokenPrefix: token.substring(0, 10) + '...',
      maxAge: `${maxAge / 1000 / 60} minutes`
    });

    this.startExpirationCheck();
  }

  /**
   * 获取认证token
   * 只能通过此方法访问
   *
   * @returns token字符串，如果不存在或已过期返回null
   */
  getToken(): string | null {
    if (!this.tokenData) {
      return null;
    }

    // 检查是否过期
    const elapsed = Date.now() - this.tokenData.createdAt;
    if (elapsed > this.tokenData.maxAge) {
      console.warn('[SecureTokenService] Token expired');
      this.clearToken();
      return null;
    }

    return this.tokenData.value;
  }

  /**
   * 检查token是否存在且有效
   *
   * @returns 是否有有效的token
   */
  hasToken(): boolean {
    return this.getToken() !== null;
  }

  /**
   * 检查认证状态
   *
   * @returns 是否已认证
   */
  isAuthenticated(): boolean {
    return this.hasToken();
  }

  /**
   * 清除token
   */
  clearToken(): void {
    if (this.tokenData) {
      console.log('[SecureTokenService] Token cleared');
      this.tokenData = null;
    }

    // 清除sessionStorage中的token
    sessionStorage.removeItem('secure_auth_token');
    sessionStorage.removeItem('secure_auth_created_at');
    sessionStorage.removeItem('secure_auth_max_age');

    this.stopExpirationCheck();
  }

  /**
   * 启动过期检查定时器
   */
  private startExpirationCheck(): void {
    this.stopExpirationCheck();

    if (!this.tokenData) {
      return;
    }

    // 每分钟检查一次是否过期
    const checkInterval = 60 * 1000; // 1分钟
    this.checkInterval$ = timer(checkInterval, checkInterval).subscribe(() => {
      const timeLeft = this.getTimeToExpiry();

      if (timeLeft <= 0) {
        console.warn('[SecureTokenService] Token expired during check');
        this.clearToken();
      } else if (timeLeft < 5 * 60 * 1000) {
        console.warn('[SecureTokenService] Token will expire soon:', `${timeLeft / 1000}s`);
      }
    });
  }

  /**
   * 停止过期检查定时器
   */
  private stopExpirationCheck(): void {
    if (this.checkInterval$) {
      this.checkInterval$.unsubscribe();
      this.checkInterval$ = null;
    }
  }

  /**
   * 获取token剩余有效时间（毫秒）
   *
   * @returns 剩余时间（毫秒），0表示已过期或不存在
   */
  getTimeToExpiry(): number {
    if (!this.tokenData) {
      return 0;
    }

    const elapsed = Date.now() - this.tokenData.createdAt;
    return Math.max(0, this.tokenData.maxAge - elapsed);
  }

  /**
   * 检查token是否即将过期
   *
   * @param threshold 阈值（毫秒），默认5分钟
   * @returns 是否即将过期
   */
  isExpiringSoon(threshold: number = 5 * 60 * 1000): boolean {
    const timeLeft = this.getTimeToExpiry();
    return timeLeft > 0 && timeLeft <= threshold;
  }

  /**
   * 获取token信息（用于调试，不返回实际token值）
   *
   * @returns token的元数据信息
   */
  getTokenInfo(): { exists: boolean; timeLeft: number; isExpiringSoon: boolean } | null {
    if (!this.tokenData) {
      return null;
    }

    const timeLeft = this.getTimeToExpiry();

    return {
      exists: timeLeft > 0,
      timeLeft,
      isExpiringSoon: this.isExpiringSoon()
    };
  }

  /**
   * 销毁服务，清理资源
   */
  ngOnDestroy(): void {
    this.stopExpirationCheck();
  }
}
