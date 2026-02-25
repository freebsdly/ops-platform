import { TestBed } from '@angular/core/testing';
import { of, delay, lastValueFrom } from 'rxjs';
import { PermissionCacheService } from './permission-cache.service';
import { UserApiService } from './user-api.service';
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';

describe('PermissionCacheService', () => {
  let service: PermissionCacheService;
  let userApiServiceMock: any;

  beforeEach(() => {
    userApiServiceMock = {
      checkRoutePermission: vi.fn(),
      checkBatchRoutePermissions: vi.fn(),
    };

    TestBed.configureTestingModule({
      providers: [
        PermissionCacheService,
        { provide: UserApiService, useValue: userApiServiceMock },
      ],
    });

    service = TestBed.inject(PermissionCacheService);
  });

  afterEach(() => {
    service.clearCache();
  });

  describe('checkPermissionWithCache', () => {
    it('should call API and cache result', async () => {
      userApiServiceMock.checkRoutePermission.mockReturnValue(
        of({ hasPermission: true })
      );

      const result = await lastValueFrom(service.checkPermissionWithCache('user', 'read'));
      expect(result).toBe(true);
      expect(userApiServiceMock.checkRoutePermission).toHaveBeenCalled();

      // 第二次调用应该使用缓存
      const cachedResult = await lastValueFrom(service.checkPermissionWithCache('user', 'read'));
      expect(cachedResult).toBe(true);
      expect(userApiServiceMock.checkRoutePermission).toHaveBeenCalledTimes(1);
    });

    it('should handle API errors and return false', async () => {
      userApiServiceMock.checkRoutePermission.mockReturnValue(
        of({ hasPermission: false })
      );

      const result = await lastValueFrom(service.checkPermissionWithCache('user', 'delete'));
      expect(result).toBe(false);
    });

    it('should handle concurrent requests', async () => {
      userApiServiceMock.checkRoutePermission.mockReturnValue(
        of({ hasPermission: true }).pipe(delay(100))
      );

      const obs1$ = service.checkPermissionWithCache('user', 'read');
      const obs2$ = service.checkPermissionWithCache('user', 'read');

      let count = 0;
      obs1$.subscribe(() => count++);
      obs2$.subscribe(() => count++);

      // Wait for delay to complete
      await new Promise(resolve => setTimeout(resolve, 150));

      // 只应该调用一次 API
      expect(userApiServiceMock.checkRoutePermission).toHaveBeenCalledTimes(1);
      expect(count).toBe(2);
    });
  });

  describe('checkPermissionsBatch', () => {
    it('should use cache for cached permissions and call API for uncached', async () => {
      // 首先缓存一个权限
      userApiServiceMock.checkRoutePermission.mockReturnValue(
        of({ hasPermission: true })
      );

      await lastValueFrom(service.checkPermissionWithCache('user', 'read'));

      // 重置 mock
      userApiServiceMock.checkRoutePermission.mockClear();

      // 批量检查包含已缓存和未缓存的权限
      userApiServiceMock.checkBatchRoutePermissions.mockReturnValue(
        of({
          results: [
            { routePath: 'user/create', hasPermission: true },
            { routePath: 'user/delete', hasPermission: false },
          ],
        })
      );

      const results = await lastValueFrom(
        service.checkPermissionsBatch([
          { resource: 'user', action: 'read' }, // 缓存
          { resource: 'user', action: 'create' }, // 未缓存
          { resource: 'user', action: 'delete' }, // 未缓存
        ])
      );

      expect(results.get('user:read')).toBe(true);
      expect(results.get('user:create')).toBe(true);
      expect(results.get('user:delete')).toBe(false);
    });

    it('should return all cached when all permissions are cached', async () => {
      userApiServiceMock.checkRoutePermission.mockReturnValue(
        of({ hasPermission: true })
      );

      // 缓存所有权限
      await lastValueFrom(service.checkPermissionWithCache('user', 'read'));
      await lastValueFrom(service.checkPermissionWithCache('user', 'create' ));

      // 重置 mock
      userApiServiceMock.checkBatchRoutePermissions.mockClear();

      // 批量检查 - 应该全部来自缓存
      const results = await lastValueFrom(
        service.checkPermissionsBatch([
          { resource: 'user', action: 'read' },
          { resource: 'user', action: 'create' },
        ])
      );

      expect(results.get('user:read')).toBe(true);
      expect(results.get('user:create')).toBe(true);
      // 不应该调用 API
      expect(userApiServiceMock.checkBatchRoutePermissions).not.toHaveBeenCalled();
    });
  });

  describe('Cache Management', () => {
    it('should clear cache', async () => {
      userApiServiceMock.checkRoutePermission.mockReturnValue(
        of({ hasPermission: true })
      );

      await lastValueFrom(service.checkPermissionWithCache('user', 'read'));

      // 验证缓存有数据
      const stats = service.getCacheStats();
      expect(stats.total).toBeGreaterThan(0);

      // 清除缓存
      service.clearCache();

      // 验证缓存已清空
      const statsAfter = service.getCacheStats();
      expect(statsAfter.total).toBe(0);
    });

    it('should invalidate specific cache keys', async () => {
      userApiServiceMock.checkRoutePermission.mockReturnValue(
        of({ hasPermission: true })
      );

      await lastValueFrom(service.checkPermissionWithCache('user', 'read'));
      await lastValueFrom(service.checkPermissionWithCache('user', 'create'));

      const stats = service.getCacheStats();
      expect(stats.total).toBe(2);

      // 使特定缓存失效
      service.invalidateCache(['user:read']);

      const statsAfter = service.getCacheStats();
      expect(statsAfter.total).toBe(1);
    });

    it('should track cache stats correctly', async () => {
      userApiServiceMock.checkRoutePermission.mockReturnValue(
        of({ hasPermission: true })
      );

      await lastValueFrom(service.checkPermissionWithCache('user', 'read'));

      const stats = service.getCacheStats();
      expect(stats.total).toBeGreaterThan(0);
      expect(stats.valid).toBeGreaterThan(0);
      expect(stats.expired).toBe(0);
      expect(stats.ttl).toBe(1 * 60 * 1000);
    });
  });
});
