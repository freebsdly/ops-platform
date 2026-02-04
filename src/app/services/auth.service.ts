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
        localStorage.setItem(this.tokenKey, response.token);
        localStorage.setItem(this.userKey, JSON.stringify(response.user));
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
    localStorage.removeItem(this.tokenKey);
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
  }

  checkAuth(): Observable<{ user: User | null; token: string | null }> {
    const token = localStorage.getItem(this.tokenKey);
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
    const token = localStorage.getItem(this.tokenKey);
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
    return localStorage.getItem(this.tokenKey);
  }

  isAuthenticated(): boolean {
    return !!localStorage.getItem(this.tokenKey);
  }
}