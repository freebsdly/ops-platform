import { Injectable, inject } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay, catchError, tap, map } from 'rxjs/operators';
import { User } from '../core/types/user.interface';
import { Router } from '@angular/router';
import { UserApiService, AuthResponse } from '../core/services/user-api.service';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly tokenKey = 'auth_token';
  private readonly userKey = 'user';
  private router = inject(Router);
  private userApiService = inject(UserApiService);

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
    return this.userApiService.logout().pipe(
      map(() => undefined),
      tap(() => {
        localStorage.removeItem(this.tokenKey);
        localStorage.removeItem(this.userKey);
      }),
      catchError((error) => {
        console.error('登出API调用失败:', error);
        // 即使API失败也清除本地状态
        localStorage.removeItem(this.tokenKey);
        localStorage.removeItem(this.userKey);
        throw error;
      })
    );
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