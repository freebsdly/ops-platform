import { Injectable, inject, OnDestroy } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay, catchError, tap, map } from 'rxjs/operators';
import { User } from '../core/types/user.interface';
import { Router } from '@angular/router';
import { UserApiService, AuthResponse } from '../core/services/user-api.service';
import { RequestCancelService } from '../core/services/request-cancel.service';
import { TimerCleanupService } from '../core/services/timer-cleanup.service';
import { WebSocketCleanupService } from '../core/services/websocket-cleanup.service';
import { ServiceWorkerCleanupService } from '../core/services/service-worker-cleanup.service';
import { CsrfTokenService } from '../core/services/csrf-token.service';
import { SecureTokenService } from '../core/services/secure-token.service';
import { UserCacheService } from '../core/services/user-cache.service';

@Injectable({
  providedIn: 'root',
})
export class AuthService implements OnDestroy {
  private router = inject(Router);
  private userApiService = inject(UserApiService);
  private requestCancelService = inject(RequestCancelService);
  private timerCleanupService = inject(TimerCleanupService);
  private webSocketCleanupService = inject(WebSocketCleanupService);
  private serviceWorkerCleanupService = inject(ServiceWorkerCleanupService);
  private csrfTokenService = inject(CsrfTokenService);
  private secureTokenService = inject(SecureTokenService);
  private userCacheService = inject(UserCacheService);
  private broadcastChannel: BroadcastChannel | null = null;

  constructor() {
    this.initBroadcastChannel();
  }

  private initBroadcastChannel() {
    if (typeof BroadcastChannel !== 'undefined') {
      this.broadcastChannel = new BroadcastChannel('auth');

      this.broadcastChannel.onmessage = (event) => {
        if (event.data?.type === 'logout') {
          this.performLogout();
        }
      };
    }
  }

  ngOnDestroy() {
    if (this.broadcastChannel) {
      this.broadcastChannel.close();
    }
  }

  login(username: string, password: string): Observable<AuthResponse> {
    return this.userApiService.login(username, password).pipe(
      tap(response => {
        // 使用安全Token服务管理token（存储在sessionStorage中）
        this.secureTokenService.setToken(response.token, 24 * 60 * 60 * 1000);

        // 缓存用户信息到内存中（不存储到localStorage）
        this.userCacheService.setUser(response.user);

        console.log('[AuthService] Login successful, user:', response.user.username);
      }),
      catchError(error => {
        console.error('登录失败:', error);
        throw error;
      })
    );
  }

  logout(): Observable<void> {
    console.log('auth.service: 开始登出流程');

    // 先清除本地状态，确保LoginGuard能正确工作
    this.performLogout();

    this.requestCancelService.cancelPendingRequests();
    if (this.broadcastChannel) {
      this.broadcastChannel.postMessage({ type: 'logout' });
    }

    // 清除CSRF token
    this.csrfTokenService.clearToken();

    // 调用API登出，但不等待它完成（fire-and-forget）
    return this.userApiService.logout().pipe(
      map(() => undefined),
      tap(() => {
        console.log('auth.service: API登出成功');
      }),
      catchError((error) => {
        console.error('auth.service: 登出API调用失败:', error);
        // 已经清除了本地状态，所以忽略API错误
        return of(undefined);
      })
    );
  }

  private performLogout() {
    // 清除安全token
    this.secureTokenService.clearToken();

    // 清除用户缓存
    this.userCacheService.clear();

    // 清除配置缓存
    localStorage.removeItem('app_layout_config');
    localStorage.removeItem('app_layout_config_timestamp');
    // 清除布局状态
    localStorage.removeItem('theme');
    localStorage.removeItem('siderCollapsed');
    // 清除语言偏好
    localStorage.removeItem('preferredLanguage');
    sessionStorage.clear();

    this.timerCleanupService.cleanup();
    this.webSocketCleanupService.cleanup();
    this.serviceWorkerCleanupService.cleanup();

    console.log('[AuthService] Local storage cleared');
  }

  checkAuth(): Observable<{ user: User | null; token: string | null }> {
    // Token由SecureTokenService管理
    const token = this.getToken();
    // 用户信息由UserCacheService管理（内存缓存）
    const user = this.userCacheService.getUser();

    return of({ user, token }).pipe(delay(100));
  }

  // Synchronous check for initial app loading
  checkAuthSync(): { user: User | null; token: string | null } {
    // Token由SecureTokenService管理
    const token = this.getToken();
    // 用户信息由UserCacheService管理（内存缓存）
    const user = this.userCacheService.getUser();

    return { user, token };
  }

  getToken(): string | null {
    // 使用安全Token服务获取token（模拟HttpOnly Cookie行为）
    return this.secureTokenService.getToken();
  }

  isAuthenticated(): boolean {
    return this.secureTokenService.isAuthenticated();
  }
}