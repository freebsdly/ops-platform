import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { of } from 'rxjs';
import { PermissionAuditService } from './permission-audit.service';
import { PermissionFacade } from '../stores/permission/permission.facade';
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';

describe('PermissionAuditService', () => {
  let service: PermissionAuditService;
  let routerMock: any;
  let permissionFacadeMock: any;

  const mockUser = {
    id: 1,
    username: 'testuser',
    email: 'test@example.com',
    name: 'Test User',
    roles: ['admin'],
    permissions: [],
  };

  beforeEach(() => {
    routerMock = {
      url: '/test-route',
    };

    permissionFacadeMock = {
      user: vi.fn().mockReturnValue(mockUser),
      userRoles: vi.fn().mockReturnValue(['admin']),
    };

    TestBed.configureTestingModule({
      providers: [
        PermissionAuditService,
        { provide: Router, useValue: routerMock },
        { provide: HttpClient, useValue: {} },
        { provide: PermissionFacade, useValue: permissionFacadeMock },
      ],
    });

    service = TestBed.inject(PermissionAuditService);
  });

  afterEach(() => {
    service.clearAuditLogs();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('logPermissionCheck', () => {
    it('should log permission check', () => {
      service.logPermissionCheck('user', 'read', true);

      const logs = service.getAuditLogs();
      expect(logs).toHaveLength(1);
      expect(logs[0]).toMatchObject({
        resource: 'user',
        action: 'read',
        granted: true,
        permission: 'user:read',
      });
    });

    it('should include user context in log', () => {
      service.logPermissionCheck('user', 'read', true, {
        method: 'checkPermission',
        component: 'MyComponent',
      });

      const logs = service.getAuditLogs();
      expect(logs[0]).toMatchObject({
        userId: mockUser.id,
        userRoles: mockUser.roles,
        context: {
          route: '/test-route',
          method: 'checkPermission',
          component: 'MyComponent',
        },
      });
    });

    it('should limit logs to max size', () => {
      const maxLogs = 100;
      for (let i = 0; i < maxLogs + 10; i++) {
        service.logPermissionCheck(`resource${i}`, 'read', true);
      }

      const logs = service.getAuditLogs();
      expect(logs).toHaveLength(maxLogs);
      // 最新的日志应该在前面（最后添加的）
      expect(logs[0].resource).toBe('resource109');
    });
  });

  describe('logRouteAccess', () => {
    it('should log route access', () => {
      service.logRouteAccess('/admin/users', true);

      const logs = service.getAuditLogs();
      expect(logs).toHaveLength(1);
      expect(logs[0]).toMatchObject({
        resource: 'route',
        action: 'access',
        permission: 'route:/admin/users',
        granted: true,
        context: {
          route: '/admin/users',
        },
      });
    });

    it('should log denied route access', () => {
      service.logRouteAccess('/admin/users', false);

      const logs = service.getAuditLogs();
      expect(logs[0]).toMatchObject({
        granted: false,
      });
    });
  });

  describe('logRoleCheck', () => {
    it('should log role check', () => {
      service.logRoleCheck('admin', true);

      const logs = service.getAuditLogs();
      expect(logs).toHaveLength(1);
      expect(logs[0]).toMatchObject({
        resource: 'role',
        action: 'check',
        permission: 'role:admin',
        granted: true,
      });
    });

    it('should log multiple role checks', () => {
      service.logRoleCheck('admin', true);
      service.logRoleCheck('manager', false);
      service.logRoleCheck('user', true);

      const logs = service.getAuditLogs();
      expect(logs).toHaveLength(3);
      // 最后添加的在前面
      expect(logs[0].permission).toBe('role:user');
      expect(logs[1].permission).toBe('role:manager');
      expect(logs[2].permission).toBe('role:admin');
    });
  });

  describe('getAuditLogs', () => {
    it('should return copy of logs', () => {
      service.logPermissionCheck('user', 'read', true);
      const logs1 = service.getAuditLogs();
      const logs2 = service.getAuditLogs();

      expect(logs1).toEqual(logs2);
      expect(logs1).not.toBe(logs2);
    });

    it('should return empty array when no logs', () => {
      const logs = service.getAuditLogs();
      expect(logs).toEqual([]);
    });
  });

  describe('exportAuditLogs', () => {
    it('should export logs as JSON string', () => {
      service.logPermissionCheck('user', 'read', true);
      service.logRoleCheck('admin', true);

      const exported = service.exportAuditLogs();
      const parsed = JSON.parse(exported);

      expect(Array.isArray(parsed)).toBe(true);
      expect(parsed).toHaveLength(2);
    });

    it('should export empty logs as empty array', () => {
      const exported = service.exportAuditLogs();
      const parsed = JSON.parse(exported);

      expect(parsed).toEqual([]);
    });
  });

  describe('clearAuditLogs', () => {
    it('should clear all logs', () => {
      service.logPermissionCheck('user', 'read', true);
      service.logRoleCheck('admin', true);

      expect(service.getAuditLogs()).toHaveLength(2);

      service.clearAuditLogs();

      expect(service.getAuditLogs()).toHaveLength(0);
    });
  });

  describe('Log Structure', () => {
    it('should include timestamp in ISO format', () => {
      service.logPermissionCheck('user', 'read', true);

      const logs = service.getAuditLogs();
      expect(logs[0].timestamp).toBeDefined();

      const timestamp = new Date(logs[0].timestamp);
      expect(timestamp.toISOString()).toBe(logs[0].timestamp);
    });

    it('should handle null user', () => {
      permissionFacadeMock.user.mockReturnValue(null);

      service.logPermissionCheck('user', 'read', true);

      const logs = service.getAuditLogs();
      expect(logs[0].userId).toBeUndefined();
    });
  });
});
