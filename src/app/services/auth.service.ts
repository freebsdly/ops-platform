import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { User } from '../core/types/user.interface';

export interface AuthResponse {
  user: User;
  token: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly tokenKey = 'auth_token';
  private readonly userKey = 'user';

  login(username: string, password: string): Observable<AuthResponse> {
    // Simulate API call
    return new Observable<AuthResponse>((observer) => {
      setTimeout(() => {
        // Mock successful login
        const user: User = {
          id: 1,
          username,
          email: `${username}@example.com`,
          name: 'Demo User',
          avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin',
          roles: ['admin'],
        };

        const token = 'mock_jwt_token_' + Date.now();

        localStorage.setItem(this.tokenKey, token);
        localStorage.setItem(this.userKey, JSON.stringify(user));

        observer.next({ user, token });
        observer.complete();
      }, 500);
    });
  }

  logout(): Observable<void> {
    return new Observable<void>((observer) => {
      localStorage.removeItem(this.tokenKey);
      localStorage.removeItem(this.userKey);
      observer.next();
      observer.complete();
    });
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

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  isAuthenticated(): boolean {
    return !!localStorage.getItem(this.tokenKey);
  }
}