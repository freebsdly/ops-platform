import { TestBed } from '@angular/core/testing';
import { of, delay } from 'rxjs';
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
    it('should call API and cache result', (done) => {
      userApiServiceMock.checkRoutePermission.mockReturnValue(
        of({ hasPermission: true })
      );

      service.checkPermissionWithCache('user', 'read').subscribe(result => {
        expect(result).toBe(true);
        expect(userApiServiceMock.checkRoutePermission).toHaveBeenCalled();

        // 第二次调用应该使用缓存
        service.checkPermissionWithCache('user', 'read').subscribe(cachedResult => {
          expect(cachedResult).toBe(true);
          expect(userApiServiceMock.checkRoutePermission).toHaveBeenCalledTimes(1);
          done();
        });
      });
    });

    it('should handle API errors and return false', (done) => {
      userApiServiceMock.checkRoutePermission.mockReturnValue(
        of({ hasPermission: false })
      );

      service.checkPermissionWithCache('user', 'delete').subscribe(result => {
        expect(result).toBe(false);
        done();
      });
    });

    it('should handle concurrent requests', (done) => {
      userApiServiceMock.checkRoutePermission.mockReturnValue(
        of({ hasPermission: true }).pipe(delay(100))
      );

      const obs1$ = service.checkPermissionWithCache('user', 'read');
      const obs2$ = service.checkPermissionWithCache('user', 'read');

      let count = 0;
      obs1$.subscribe(() => count++);
      obs2$.subscribe(() => count++);

      setTimeout(() => {
        // 只应该调用一次 API
        expect(userApiServiceMock.checkRoutePermission).toHaveBeenCalledTimes(1);
        done();
      }, 150);
    });
  });

  describe('checkPermissionsBatch', () => {
    it('should use cache for cached permissions and call API for uncached', (done) => {
      // 首先缓存一个权限
      userApiServiceMock.checkRoutePermission.mockReturnValue(
        of({ hasPermission: true })
      );

      service.checkPermissionWithCache('user', 'read').subscribe(() => {
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

        service
          .checkPermissionsBatch([
            { resource: 'user', action: 'read' }, // 缓存
            { resource: 'user', action: 'create' }, // 未缓存
            { resource: 'user', action: 'delete' }, // 未缓存
          ])
          .subscribe(results => {
            expect(results.get('user:read')).toBe(true);
            expect(results.get('user:create')).toBe(true);
            expect(results.get('user:delete')).toBe(false);
            done();
          });
      });
    });

    it('should return all cached when all permissions are cached', (done) => {
      userApiServiceMock.checkRoutePermission.mockReturnValue(
        of({ hasPermission: true })
      );

      // 缓存所有权限
      service.checkPermissionWithCache('user', 'read').subscribe(() => {
        service.checkPermissionWithCache('user', 'create').subscribe(() => {
          // 重置 mock
          userApiServiceMock.checkBatchRoutePermissions.mockClear();

          // 批量检查 - 应该全部来自缓存
          service
            .checkPermissionsBatch([
              { resource: 'user', action: 'read' },
              { resource: 'user', action: 'create' },
            ])
            .subscribe(results => {
              expect(results.get('user:read')).toBe(true);
              expect(results.get('user:create')).toBe(true);
              // 不应该调用 API
              expect(userApiServiceMock.checkBatchRoutePermissions).not.toHaveBeenCalled();
              done();
            });
        });
      });
    });
  });

  describe('Cache Management', () => {
    it('should clear cache', () => {
      userApiServiceMock.checkRoutePermission.mockReturnValue(
        of({ hasPermission: true })
      );

      service.checkPermissionWithCache('user', 'read').subscribe(() => {
        // 验证缓存有数据
        const stats = service.getCacheStats();
        expect(stats.total).toBeGreaterThan(0);

        // 清除缓存
        service.clearCache();

        // 验证缓存已清空
        const statsAfter = service.getCacheStats();
        expect(statsAfter.total).toBe(0);
      });
    });

    it('should invalidate specific cache keys', () => {
      userApiServiceMock.checkRoutePermission.mockReturnValue(
        of({ hasPermission: true })
      );

      service.checkPermissionWithCache('user', 'read').subscribe(() => {
        service.checkPermissionWithCache('user', 'create').subscribe(() => {
          const stats = service.getCacheStats();
          expect(stats.total).toBe(2);

          // 使特定缓存失效
          service.invalidateCache(['user:read']);

          const statsAfter = service.getCacheStats();
          expect(statsAfter.total).toBe(1);
        });
      });
    });

    it('should track cache stats correctly', () => {
      userApiServiceMock.checkRoutePermission.mockReturnValue(
        of({ hasPermission: true })
      );

      service.checkPermissionWithCache('user', 'read').subscribe(() => {
        const stats = service.getCacheStats();
        expect(stats.total).toBeGreaterThan(0);
        expect(stats.valid).toBeGreaterThan(0);
        expect(stats.expired).toBe(0);
        expect(stats.ttl).toBe(1 * 60 * 1000);
      });
    });
  });
});
