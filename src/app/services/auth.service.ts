import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly tokenKey = 'auth_token';
  private readonly userKey = 'user';
  private readonly tabsKey = 'app_tabs';
  
  authState = signal<{isAuthenticated: boolean; user: { name: string; email: string } | null}>({
    isAuthenticated: !!localStorage.getItem(this.tokenKey),
    user: localStorage.getItem(this.userKey) 
      ? JSON.parse(localStorage.getItem(this.userKey)!) 
      : null
  });

  login(email: string, password: string): Promise<boolean> {
    // Simulate API call
    return new Promise((resolve) => {
      setTimeout(() => {
        // Mock successful login (any email/password combination works for demo)
        const token = 'mock_jwt_token_' + Date.now();
        const user = {
          name: 'Demo User',
          email: email,
        };
        
        localStorage.setItem(this.tokenKey, token);
        localStorage.setItem(this.userKey, JSON.stringify(user));
        
        this.authState.set({
          isAuthenticated: true,
          user: user
        });
        resolve(true);
      }, 500);
    });
  }

  logout(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.userKey);
    localStorage.removeItem(this.tabsKey);
    this.authState.set({
      isAuthenticated: false,
      user: null
    });
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  isAuthenticated(): boolean {
    return !!localStorage.getItem(this.tokenKey);
  }
}