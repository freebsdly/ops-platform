export class MockCookieHelper {
  /**
   * 模拟设置HttpOnly Cookie
   * 在开发环境中使用localStorage模拟HttpOnly Cookie
   */
  static setCookie(name: string, value: string, options: {
    httpOnly?: boolean;
    secure?: boolean;
    sameSite?: 'strict' | 'lax' | 'none';
    maxAge?: number;
  } = {}): void {
    const storageKey = `cookie_${name}`;
    const cookieData = {
      value,
      httpOnly: options.httpOnly || false,
      secure: options.secure || false,
      sameSite: options.sameSite || 'lax',
      maxAge: options.maxAge,
      createdAt: Date.now()
    };

    try {
      localStorage.setItem(storageKey, JSON.stringify(cookieData));

      // 如果不是httpOnly，也可以存到document.cookie
      if (!options.httpOnly) {
        document.cookie = `${name}=${value}`;
      }

      console.log(`[MockCookieHelper] Set cookie: ${name}`, {
        httpOnly: options.httpOnly,
        sameSite: options.sameSite,
        maxAge: options.maxAge
      });
    } catch (error) {
      console.error(`[MockCookieHelper] Error setting cookie: ${name}`, error);
    }
  }

  /**
   * 模拟获取Cookie
   * 优先从localStorage读取（模拟HttpOnly Cookie）
   * 其次从document.cookie读取
   */
  static getCookie(name: string): string | null {
    // 优先从localStorage读取（模拟HttpOnly Cookie）
    const storageKey = `cookie_${name}`;
    const stored = localStorage.getItem(storageKey);

    if (stored) {
      try {
        const cookieData = JSON.parse(stored);

        // 检查是否过期
        if (cookieData.maxAge) {
          const elapsed = Date.now() - cookieData.createdAt;
          if (elapsed > cookieData.maxAge * 1000) {
            console.log(`[MockCookieHelper] Cookie expired: ${name}`);
            this.removeCookie(name);
            return null;
          }
        }

        return cookieData.value;
      } catch (error) {
        console.error(`[MockCookieHelper] Error parsing cookie: ${name}`, error);
        return null;
      }
    }

    // 尝试从document.cookie读取
    const cookies = document.cookie.split(';');
    const cookie = cookies.find(c => c.trim().startsWith(`${name}=`));
    if (cookie) {
      return cookie.split('=')[1];
    }

    return null;
  }

  /**
   * 模拟删除Cookie
   */
  static removeCookie(name: string): void {
    const storageKey = `cookie_${name}`;
    localStorage.removeItem(storageKey);
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC`;
    console.log(`[MockCookieHelper] Removed cookie: ${name}`);
  }

  /**
   * 清除所有模拟的Cookie
   */
  static clearAll(): void {
    try {
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith('cookie_')) {
          localStorage.removeItem(key);
        }
      });
      console.log('[MockCookieHelper] Cleared all mock cookies');
    } catch (error) {
      console.error('[MockCookieHelper] Error clearing cookies:', error);
    }
  }

  /**
   * 检查Cookie是否存在
   */
  static hasCookie(name: string): boolean {
    return this.getCookie(name) !== null;
  }

  /**
   * 获取所有Cookie名称
   */
  static getAllCookieNames(): string[] {
    const names: string[] = [];

    try {
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith('cookie_')) {
          names.push(key.replace('cookie_', ''));
        }
      });
    } catch (error) {
      console.error('[MockCookieHelper] Error getting cookie names:', error);
    }

    return names;
  }
}
