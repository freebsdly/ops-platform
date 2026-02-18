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

@Injectable({
  providedIn: 'root',
})
export class AuthService implements OnDestroy {
  private readonly tokenKey = 'auth_token';
  private readonly userKey = 'user';
  private router = inject(Router);
  private userApiService = inject(UserApiService);
  private requestCancelService = inject(RequestCancelService);
  private timerCleanupService = inject(TimerCleanupService);
  private webSocketCleanupService = inject(WebSocketCleanupService);
  private serviceWorkerCleanupService = inject(ServiceWorkerCleanupService);
  private csrfTokenService = inject(CsrfTokenService);
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
        // Token现在由MSW通过模拟Cookie管理，不再存储到localStorage
        // localStorage.setItem(this.tokenKey, response.token);
        localStorage.setItem(this.userKey, JSON.stringify(response.user));
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
    // Token现在由模拟Cookie管理，不再需要清除localStorage中的token
    // localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.userKey);
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
    // Token现在由模拟Cookie管理
    const token = this.getToken();
    const userStr = localStorage.getItem(this.userKey);

    let user: User | null = null;
    if (userStr) {
      try {
        user = JSON.parse(userStr);
      } catch {
        user = null;
      }
    }

    return of({ user, token }).pipe(delay(100));
  }

  // Synchronous check for initial app loading
  checkAuthSync(): { user: User | null; token: string | null } {
    // Token现在由模拟Cookie管理
    const token = this.getToken();
    const userStr = localStorage.getItem(this.userKey);

    let user: User | null = null;
    if (userStr) {
      try {
        user = JSON.parse(userStr);
      } catch {
        user = null;
      }
    }

    return { user, token };
  }

  getToken(): string | null {
    // 从模拟Cookie读取token
    // 在真实环境中，这将由浏览器自动处理，此方法仅用于检查
    const cookieToken = localStorage.getItem('cookie_auth_token');

    if (cookieToken) {
      try {
        const cookieData = JSON.parse(cookieToken);
        // 检查是否过期
        if (cookieData.maxAge) {
          const elapsed = Date.now() - cookieData.createdAt;
          if (elapsed > cookieData.maxAge * 1000) {
            localStorage.removeItem('cookie_auth_token');
            return null;
          }
        }
        return cookieData.value;
      } catch {
        return null;
      }
    }

    // 向后兼容：旧的localStorage存储
    const oldToken = localStorage.getItem('auth_token');
    if (oldToken) {
      return oldToken;
    }

    return null;
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }
}