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
    this.requestCancelService.cancelPendingRequests();

    if (this.broadcastChannel) {
      this.broadcastChannel.postMessage({ type: 'logout' });
    }

    return this.userApiService.logout().pipe(
      map(() => undefined),
      tap(() => {
        this.performLogout();
      }),
      catchError((error) => {
        console.error('登出API调用失败:', error);
        this.performLogout();
        return of(undefined);
      })
    );
  }

  private performLogout() {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.userKey);
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