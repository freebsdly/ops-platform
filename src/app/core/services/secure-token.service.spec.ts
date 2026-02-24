import { TestBed, tick, fakeAsync } from '@angular/core/testing';
import { SecureTokenService } from './secure-token.service';

describe('SecureTokenService', () => {
  let service: SecureTokenService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SecureTokenService);
  });

  afterEach(() => {
    service.ngOnDestroy();
  });

  describe('Token存储', () => {
    it('应该将token存储在内存中，而不是localStorage', () => {
      const testToken = 'test-token-12345';

      service.setToken(testToken);

      // token不应该在localStorage中
      expect(localStorage.getItem('auth_token')).toBeNull();
      expect(localStorage.getItem('cookie_auth_token')).toBeNull();

      // 也不应该在sessionStorage中
      expect(sessionStorage.getItem('auth_token')).toBeNull();
    });

    it('应该能够存储和获取token', () => {
      const testToken = 'mock_jwt_token_123456789_user_1';

      service.setToken(testToken);
      const retrievedToken = service.getToken();

      expect(retrievedToken).toBe(testToken);
    });

    it('设置token时应该使用正确的默认过期时间（24小时）', () => {
      // 使用fakeAsync来测试时间相关逻辑
      const testToken = 'test-token-with-expiry';

      service.setToken(testToken);

      const timeToExpiry = service.getTimeToExpiry();
      // 24小时 = 86400000毫秒
      expect(timeToExpiry).toBeGreaterThan(24 * 60 * 60 * 1000 - 1000);
      expect(timeToExpiry).toBeLessThanOrEqual(24 * 60 * 60 * 1000);
    });

    it('应该支持自定义过期时间', () => {
      const testToken = 'test-token-custom-expiry';
      const customMaxAge = 60 * 1000; // 1分钟

      service.setToken(testToken, customMaxAge);

      const timeToExpiry = service.getTimeToExpiry();
      expect(timeToExpiry).toBeGreaterThan(customMaxAge - 100);
      expect(timeToExpiry).toBeLessThanOrEqual(customMaxAge);
    });
  });

  describe('Token过期', () => {
    it('应该正确处理token过期', fakeAsync(() => {
      const testToken = 'test-token-expiring-soon';
      const shortExpiry = 100; // 100毫秒

      service.setToken(testToken, shortExpiry);

      // 立即获取应该成功
      expect(service.getToken()).toBe(testToken);

      // 等待超过过期时间
      tick(150);

      // 现在应该返回null
      expect(service.getToken()).toBeNull();
    }));

    it('过期后hasToken应该返回false', fakeAsync(() => {
      const testToken = 'test-token';
      service.setToken(testToken, 100);

      expect(service.hasToken()).toBe(true);

      tick(150);

      expect(service.hasToken()).toBe(false);
    }));

    it('过期后isAuthenticated应该返回false', fakeAsync(() => {
      const testToken = 'test-token';
      service.setToken(testToken, 100);

      expect(service.isAuthenticated()).toBe(true);

      tick(150);

      expect(service.isAuthenticated()).toBe(false);
    }));
  });

  describe('Token清理', () => {
    it('应该能够清除token', () => {
      const testToken = 'test-token-to-clear';

      service.setToken(testToken);
      expect(service.getToken()).toBe(testToken);

      service.clearToken();
      expect(service.getToken()).toBeNull();
      expect(service.hasToken()).toBe(false);
    });

    it('清除token后，所有相关方法都应该返回空值', () => {
      service.setToken('test-token');
      service.clearToken();

      expect(service.getToken()).toBeNull();
      expect(service.hasToken()).toBe(false);
      expect(service.isAuthenticated()).toBe(false);
      expect(service.getTimeToExpiry()).toBe(0);
      expect(service.getTokenInfo()).toBeNull();
    });
  });

  describe('XSS防护', () => {
    it('应该防止XSS攻击从localStorage窃取token', () => {
      const secretToken = 'secret-token-xyz-123';

      service.setToken(secretToken);

      // 模拟XSS攻击尝试
      const stolenFromLocalStorage = localStorage.getItem('auth_token');
      const stolenFromSessionStorage = sessionStorage.getItem('auth_token');
      const stolenFromMockCookie = localStorage.getItem('cookie_auth_token');

      // 所有尝试都应该失败
      expect(stolenFromLocalStorage).toBeNull();
      expect(stolenFromSessionStorage).toBeNull();
      expect(stolenFromMockCookie).toBeNull();

      // 只有服务方法可以访问
      expect(service.getToken()).toBe(secretToken);
    });

    it('多次设置token应该覆盖之前的token', () => {
      const firstToken = 'first-token-123';
      const secondToken = 'second-token-456';

      service.setToken(firstToken);
      expect(service.getToken()).toBe(firstToken);

      service.setToken(secondToken);
      expect(service.getToken()).toBe(secondToken);

      // 确保第一个token不再可访问
      expect(service.getToken()).not.toBe(firstToken);
    });
  });

  describe('Token信息', () => {
    it('应该返回正确的token信息', () => {
      const testToken = 'test-token-info';
      const maxAge = 60 * 60 * 1000; // 1小时

      service.setToken(testToken, maxAge);

      const info = service.getTokenInfo();

      expect(info).not.toBeNull();
      expect(info?.exists).toBe(true);
      expect(info?.timeLeft).toBeGreaterThan(0);
      expect(info?.timeLeft).toBeLessThanOrEqual(maxAge);
    });

    it('没有token时应该返回null', () => {
      const info = service.getTokenInfo();
      expect(info).toBeNull();
    });

    it('isExpiringSoon应该正确检测即将过期的token', fakeAsync(() => {
      const testToken = 'test-token-expiring';
      const fiveMinutes = 5 * 60 * 1000;
      const tenSeconds = 10 * 1000;

      service.setToken(testToken, fiveMinutes + tenSeconds);

      // 5分钟内应该算作即将过期
      expect(service.isExpiringSoon()).toBe(true);

      // 使用1小时的阈值
      expect(service.isExpiringSoon(60 * 60 * 1000)).toBe(false);
    }));
  });

  describe('边界情况', () => {
    it('应该正确处理null或undefined', () => {
      expect(service.getToken()).toBeNull();
      expect(service.hasToken()).toBe(false);
      expect(service.isAuthenticated()).toBe(false);
    });

    it('应该正确处理空字符串', () => {
      service.setToken('');

      // 空字符串仍然会被存储（这是有效token格式）
      expect(service.getToken()).toBe('');
      expect(service.hasToken()).toBe(true);
    });

    it('应该正确处理非常长的token', () => {
      const longToken = 'a'.repeat(5000);
      service.setToken(longToken);

      expect(service.getToken()).toBe(longToken);
      expect(service.getToken()?.length).toBe(5000);
    });

    it('应该正确处理特殊字符', () => {
      const specialToken = 'token-with-special-chars-!@#$%^&*()_+-=[]{}|;\':",./<>?';
      service.setToken(specialToken);

      expect(service.getToken()).toBe(specialToken);
    });

    it('多次调用clearToken应该是安全的', () => {
      service.setToken('test-token');

      service.clearToken();
      service.clearToken();
      service.clearToken();

      expect(service.getToken()).toBeNull();
    });
  });

  describe('资源清理', () => {
    it('销毁服务时应该清理定时器', () => {
      service.setToken('test-token');
      service.ngOnDestroy();

      // 销毁后，服务应该仍然可以工作（只是定时器被清理）
      expect(service.getToken()).toBe('test-token');
    });

    it('设置新token应该清理旧token的定时器', () => {
      service.setToken('first-token', 1000);
      service.setToken('second-token', 2000);

      expect(service.getToken()).toBe('second-token');
    });
  });
});
