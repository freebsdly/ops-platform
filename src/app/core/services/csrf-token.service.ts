import { Injectable } from '@angular/core';

/**
 * CSRF Token服务
 *
 * 使用sessionStorage存储CSRF token
 * 避免localStorage暴露，同时保持跨标签页共享
 */
@Injectable({
  providedIn: 'root'
})
export class CsrfTokenService {
  private readonly CSRF_TOKEN_KEY = 'csrf_token';
  private readonly CSRF_HEADER_NAME = 'X-CSRF-Token';

  /**
   * 生成CSRF token
   */
  private generateToken(): string {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 15);
    return `${timestamp}-${random}`;
  }

  /**
   * 生成并存储CSRF token到sessionStorage
   */
  generateAndStoreToken(): string {
    const token = this.generateToken();
    try {
      sessionStorage.setItem(this.CSRF_TOKEN_KEY, token);
      console.log('[CsrfTokenService] Generated and stored CSRF token in sessionStorage');
      return token;
    } catch (error) {
      console.error('[CsrfTokenService] Error storing CSRF token:', error);
      throw error;
    }
  }

  /**
   * 获取当前CSRF token
   */
  getToken(): {
    token: string;
    header: string;
  } {
    const token = sessionStorage.getItem(this.CSRF_TOKEN_KEY);

    if (!token) {
      console.log('[CsrfTokenService] No CSRF token found, generating new one');
      const newToken = this.generateAndStoreToken();
      return {
        token: newToken,
        header: this.CSRF_HEADER_NAME
      };
    }

    return {
      token,
      header: this.CSRF_HEADER_NAME
    };
  }

  /**
   * 验证CSRF token
   */
  validateToken(token: string): boolean {
    const storedToken = sessionStorage.getItem(this.CSRF_TOKEN_KEY);

    if (!storedToken) {
      console.error('[CsrfTokenService] No stored CSRF token to validate');
      return false;
    }

    const isValid = storedToken === token;

    if (!isValid) {
      console.error('[CsrfTokenService] CSRF token validation failed');
    } else {
      console.log('[CsrfTokenService] CSRF token validated successfully');
    }

    return isValid;
  }

  /**
   * 清除CSRF token
   */
  clearToken(): void {
    try {
      sessionStorage.removeItem(this.CSRF_TOKEN_KEY);
      console.log('[CsrfTokenService] CSRF token cleared from sessionStorage');
    } catch (error) {
      console.error('[CsrfTokenService] Error clearing CSRF token:', error);
    }
  }

  /**
   * 刷新CSRF token
   */
  refreshToken(): string {
    this.clearToken();
    return this.generateAndStoreToken();
  }

  /**
   * 检查是否有有效的CSRF token
   */
  hasValidToken(): boolean {
    const token = sessionStorage.getItem(this.CSRF_TOKEN_KEY);
    return !!token && token.length > 0;
  }
}
