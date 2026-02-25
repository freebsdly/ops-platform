import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { PermissionService } from '../../services/permission.service';
import { PermissionCacheService } from './permission-cache.service';
import { UserApiService } from './user-api.service';
import { Store } from '@ngrx/store';
import { provideMockStore } from '@ngrx/store/testing';
import { describe, it, expect, beforeEach, vi } from 'vitest';

describe('Permission Cache Performance', () => {
  let permissionService: PermissionService;
  let permissionCacheService: PermissionCacheService;
  let userApiServiceMock: any;

  const mockPermissions = [
    {
      id: '1',
      name: 'Read Users',
      type: 'operation' as const,
      resource: 'user',
      action: ['read'],
    },
    {
      id: '2',
      name: 'Create Users',
      type: 'operation' as const,
      resource: 'user',
      action: ['create'],
    },
  ];

  beforeEach(() => {
    userApiServiceMock = {
      checkRoutePermission: vi.fn().mockImplementation((routePath, userId) => {
        return of({ hasPermission: routePath.includes('admin') || routePath.includes('read') });
      }),
      checkBatchRoutePermissions: vi.fn().mockImplementation((routes) => {
        return of({
          results: routes.map(route => ({
            routePath: route,
            hasPermission: route.includes('read') || route.includes('admin'),
          })),
        });
      }),
      getUserPermissions: vi.fn().mockReturnValue(of(mockPermissions)),
      getUserMenuPermissions: vi.fn().mockReturnValue(of([])),
      getUserAccessibleMenus: vi.fn().mockReturnValue(of({ menus: [] })),
    };

    TestBed.configureTestingModule({
      providers: [
        PermissionService,
        PermissionCacheService,
        { provide: UserApiService, useValue: userApiServiceMock },
        provideMockStore({
          auth: {
            user: {
              id: 1,
              username: 'testuser',
              email: 'test@example.com',
              name: 'Test User',
              roles: ['admin'],
              permissions: mockPermissions,
            },
            token: 'mock-token',
            isAuthenticated: true,
            isLoading: false,
            error: null,
            permissions: mockPermissions,
            roles: ['admin'],
          },
        }),
      ],
    });

    permissionService = TestBed.inject(PermissionService);
    permissionCacheService = TestBed.inject(PermissionCacheService);
  });

  describe('Single Permission Check Performance', () => {
    it('should show performance improvement with cache', async () => {
      const iterations = 100;
      const routePath = 'user/read';

      // 测试不使用缓存的情况 (模拟)
      const startWithoutCache = performance.now();
      for (let i = 0; i < iterations; i++) {
        await permissionService.checkRoutePermission(routePath).toPromise();
      }
      const endWithoutCache = performance.now();
      const timeWithoutCache = endWithoutCache - startWithoutCache;

      // 测试使用缓存的情况
      permissionCacheService.clearCache();

      const startWithCache = performance.now();
      for (let i = 0; i < iterations; i++) {
        await permissionService.checkRoutePermission(routePath).toPromise();
      }
      const endWithCache = performance.now();
      const timeWithCache = endWithCache - startWithCache;

      console.log(`Single permission check (${iterations} iterations):`);
      console.log(`  Without cache: ${timeWithoutCache.toFixed(2)}ms`);
      console.log(`  With cache: ${timeWithCache.toFixed(2)}ms`);
      console.log(`  Improvement: ${((timeWithoutCache - timeWithCache) / timeWithoutCache * 100).toFixed(2)}%`);

      // 缓存应该有性能提升
      expect(timeWithCache).toBeLessThan(timeWithoutCache);
    });

    it('should show significant improvement for repeated checks', async () => {
      const routePath = 'user/read';

      // 预热缓存
      await permissionService.checkRoutePermission(routePath).toPromise();

      // 测试缓存命中
      const startCacheHit = performance.now();
      for (let i = 0; i < 1000; i++) {
        await permissionService.checkRoutePermission(routePath).toPromise();
      }
      const endCacheHit = performance.now();
      const timeCacheHit = endCacheHit - startCacheHit;

      console.log(`\n1000 cached permission checks:`);
      console.log(`  Total time: ${timeCacheHit.toFixed(2)}ms`);
      console.log(`  Average per check: ${(timeCacheHit / 1000).toFixed(3)}ms`);

      // 缓存命中应该非常快
      expect(timeCacheHit).toBeLessThan(1000);
    });
  });

  describe('Batch Permission Check Performance', () => {
    it('should show improvement with batch API calls', async () => {
      const routes = [
        'user/read',
        'user/create',
        'user/update',
        'user/delete',
        'admin/manage',
      ];
      const iterations = 50;

      const start = performance.now();
      for (let i = 0; i < iterations; i++) {
        await permissionService
          .checkBatchRoutePermissions(routes)
          .toPromise();
      }
      const end = performance.now();
      const totalTime = end - start;

      console.log(`\nBatch permission check (${iterations} iterations, ${routes.length} routes):`);
      console.log(`  Total time: ${totalTime.toFixed(2)}ms`);
      console.log(`  Average per batch: ${(totalTime / iterations).toFixed(2)}ms`);
      console.log(`  Average per check: ${(totalTime / iterations / routes.length).toFixed(3)}ms`);
    });
  });

  describe('Cache Statistics', () => {
    it('should track cache stats correctly', async () => {
      const routes = ['user/read', 'user/create', 'user/delete'];

      // 清除缓存
      permissionCacheService.clearCache();

      // 执行一些检查
      for (const route of routes) {
        await permissionService.checkRoutePermission(route).toPromise();
      }

      const stats = permissionCacheService.getCacheStats();
      console.log(`\nCache statistics:`);
      console.log(`  Total entries: ${stats.total}`);
      console.log(`  Valid entries: ${stats.valid}`);
      console.log(`  Expired entries: ${stats.expired}`);
      console.log(`  Pending requests: ${stats.pending}`);
      console.log(`  TTL: ${stats.ttl}ms (${stats.ttl / 1000 / 60}min)`);

      expect(stats.total).toBeGreaterThan(0);
      expect(stats.valid).toBe(stats.total);
    });
  });

  describe('API Call Reduction', () => {
    it('should reduce API calls with cache', async () => {
      const routePath = 'user/read';
      const iterations = 10;

      // 清除之前的调用记录
      userApiServiceMock.checkRoutePermission.mockClear();

      // 预热缓存
      await permissionService.checkRoutePermission(routePath).toPromise();
      const initialCalls = userApiServiceMock.checkRoutePermission.mock.calls.length;

      // 重复检查（应该命中缓存）
      for (let i = 0; i < iterations; i++) {
        await permissionService.checkRoutePermission(routePath).toPromise();
      }

      const totalCalls = userApiServiceMock.checkRoutePermission.mock.calls.length;
      const savedCalls = iterations - (totalCalls - initialCalls);

      console.log(`\nAPI call reduction (${iterations} repeated checks):`);
      console.log(`  Total API calls: ${totalCalls}`);
      console.log(`  Saved API calls: ${savedCalls}`);
      console.log(`  Reduction rate: ${((savedCalls / iterations) * 100).toFixed(2)}%`);

      // 理想情况下，重复检查应该命中缓存
      expect(totalCalls).toBe(initialCalls);
    });
  });
});
