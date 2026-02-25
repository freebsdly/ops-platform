# DevOps Platform 优化执行计划

## 概述
基于 Angular v21+ 最佳实践和权限模型最佳实践，全面优化项目的权限架构、状态管理和性能。采用 NgRx + Signals 混合架构，在保留 NgRx 强大功能的同时，利用 Signals 提升开发体验和性能。

---

# 权限系统优化方案

## 概述
基于当前项目的权限架构分析和行业最佳实践，制定权限系统优化方案，采用 RBAC + Resource-Based 混合模型，结合 NgRx + Signals 混合架构。

## 当前权限架构分析

### 优势 ✅
- 已实现 RBAC + Resource-Based 混合权限模型
- 多层防护（路由守卫、指令、管道）
- NgRx 状态管理
- API 权限回退机制
- 已实现安全令牌存储（SecureTokenService）

### 待改进 ⚠️
| 方面 | 当前实现 | 建议改进 | 优先级 |
|------|---------|----------|---------|
| 状态管理 | 纯 NgRx Observable | **NgRx + Signals 混合** | 🔴 高 |
| 守卫实现 | 类守卫 | **Functional Guards** | 🟡 中 |
| 权限来源 | **后端 API 唯一来源** | **保持后端为唯一来源，移除本地缓存** | 🔴 高 |
| 权限缓存 | 简单内存缓存 | **仅短期会话缓存，权限变更实时从后端获取** | 🔴 高 |
| 类型安全 | 部分类型安全 | **完全类型安全的权限常量** | 🔴 高 |
| 权限审计 | 未实现 | **添加权限审计日志** | 🔴 高 |
| 批量权限检查 | 已实现 | **优化批量检查性能** | 🟡 中 |
| 无权限页面 | 未实现 | **创建统一的无权限页面** | 🟡 中 |
| 错误处理 | 部分实现 | **统一权限错误处理** | 🟡 中 |
| 多标签同步 | 未实现 | **使用 BroadcastChannel 同步缓存** | 🟢 低 |

---

## 优化方案

### 阶段1：NgRx + Signals 混合架构 (高优先级)

#### 目标
在保留 NgRx 全局状态管理功能的同时，利用 Signals 提升组件层的开发体验和性能。

#### 任务1.1：创建 Permission Facade

**新建文件**：`src/app/core/stores/permission/permission.facade.ts`

**核心功能**：
- 使用 `toSignal()` 将 NgRx Selectors 转换为 Signals
- 提供派生计算的权限检查 Signals
- 统一权限检查 API

```typescript
import { Injectable, inject, computed } from '@angular/core';
import { Store } from '@ngrx/store';
import { toSignal } from '@angular/core/rxjs-interop';
import { AppState, AuthSelectors } from '../auth';
import { PermissionActions } from './permission.actions';
import { PermissionService } from '../../services/permission.service';

@Injectable({ providedIn: 'root' })
export class PermissionFacade {
  private store = inject(Store<AppState>);
  private permissionService = inject(PermissionService);

  // ✅ NgRx 数据源转换为 Signals
  readonly permissions = toSignal(
    this.store.select(AuthSelectors.selectPermissions),
    { initialValue: [] }
  );

  readonly user = toSignal(
    this.store.select(AuthSelectors.selectUser),
    { initialValue: null }
  );

  readonly userRoles = toSignal(
    this.store.select(AuthSelectors.selectUserRoles),
    { initialValue: [] }
  );

  readonly isLoading = toSignal(
    this.store.select(AuthSelectors.selectIsLoading),
    { initialValue: false }
  );

  // ✅ 派生计算 - 自动响应权限变更
  readonly isAuthenticated = computed(() => !!this.user());
  readonly isAdmin = computed(() => this.userRoles().includes('admin'));
  readonly canAccessAdminPanel = computed(() =>
    this.isAdmin() && this.isAuthenticated()
  );

  // ✅ 资源级别权限检查
  hasPermission(resource: string, action: string): boolean {
    return this.permissionService.hasPermission(resource, action);
  }

  // ✅ 返回 Signal 用于模板
  hasPermissionSignal(resource: string, action: string) {
    return computed(() => this.hasPermission(resource, action));
  }

  // ✅ 角色检查
  hasRole(roleId: string): boolean {
    return this.userRoles().includes(roleId);
  }

  // ✅ 加载权限 (通过 NgRx)
  loadPermissions(userId: number) {
    this.store.dispatch(PermissionActions.loadPermissions({ userId }));
  }

  // ✅ 清除权限 (通过 NgRx)
  clearPermissions() {
    this.store.dispatch(PermissionActions.clearPermissions());
  }
}
```

#### 任务1.2：更新守卫使用 Facade

**修改文件**：
- `src/app/guards/permission.guard.ts`
- `src/app/guards/role.guard.ts`

**改动**：

```typescript
// permission.guard.ts - 重构为 Functional Guard
import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Observable, of, filter, take, switchMap, map } from 'rxjs';
import { PermissionFacade } from '../core/stores/permission/permission.facade';
import { Store } from '@ngrx/store';
import { AppState, AuthSelectors } from '../core/stores/auth';

export const permissionGuard = (
  requiredPermissions?: { resource: string; action: string },
  requiredRoles?: string[]
): CanActivateFn => {
  return (route, state) => {
    const permissionFacade = inject(PermissionFacade);
    const router = inject(Router);
    const store = inject(Store<AppState>);

    // 等待认证检查完成
    return store.select(AuthSelectors.selectIsLoading).pipe(
      filter(isLoading => !isLoading),
      take(1),
      switchMap(() => {
        // 检查角色
        if (requiredRoles && requiredRoles.length > 0) {
          const hasRole = requiredRoles.some(role =>
            permissionFacade.hasRole(role)
          );
          if (!hasRole) {
            return of(router.createUrlTree(['/no-permission']));
          }
        }

        // 检查权限
        if (requiredPermissions) {
          const hasPermission = permissionFacade.hasPermission(
            requiredPermissions.resource,
            requiredPermissions.action
          );
          if (!hasPermission) {
            return of(router.createUrlTree(['/no-permission']));
          }
        }

        // 检查菜单权限
        return of(true);
      })
    );
  };
};

// 使用方式
{
  path: 'users',
  canActivate: [permissionGuard({ resource: 'user', action: 'read' })]
}
```

#### 任务1.3：重构组件使用 Signals

**修改文件**：
- `src/app/layout/user-info/user-info.ts`
- 其他使用权限检查的组件

**改动示例**：

```typescript
// user-info.ts
import { Component, ChangeDetectionStrategy, computed } from '@angular/core';
import { PermissionFacade } from '../../core/stores/permission/permission.facade';

@Component({
  selector: 'app-user-info',
  template: `
    @if (isAuthenticated()) {
      <div class="user-info">
        <nz-avatar [nzSrc]="user()?.avatar"></nz-avatar>
        <div class="user-details">
          <div class="user-name">{{ user()?.name }}</div>
          <div class="user-role">{{ displayRole() }}</div>
        </div>
      </div>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UserInfoComponent {
  private permissionFacade = inject(PermissionFacade);

  // ✅ 直接使用 Signals，无需订阅
  readonly user = this.permissionFacade.user;
  readonly isAuthenticated = this.permissionFacade.isAuthenticated;

  // ✅ 派生计算
  readonly displayRole = computed(() => {
    const roles = this.permissionFacade.userRoles();
    if (roles.includes('admin')) return 'Administrator';
    if (roles.includes('manager')) return 'Manager';
    return 'User';
  });
}
```

---

### 阶段2：权限缓存优化 (高优先级)

#### 目标
实现短期会话缓存，减少 API 调用，同时确保权限变更实时从后端获取。后端是权限为唯一来源。

#### 任务2.1：创建 PermissionCacheService

**新建文件**：`src/app/core/services/permission-cache.service.ts`

**核心功能**：
- 权限检查结果短期缓存（TTL 1分钟，快速响应）
- 请求去重（避免同一权限重复检查）
- 批量权限检查优化
- 多标签页同步（使用 BroadcastChannel）
- **重要：缓存仅为性能优化，权限最终由后端决定**

```typescript
import { Injectable, inject } from '@angular/core';
import { Observable, of, map, tap, finalize, catchError } from 'rxjs';
import { UserApiService } from './user-api.service';

@Injectable({ providedIn: 'root' })
export class PermissionCacheService {
  private userApiService = inject(UserApiService);

  // 权限检查缓存（仅短期缓存，TTL 1分钟）
  private permissionsCache = new Map<string, { value: boolean; timestamp: number }>();
  private readonly CACHE_TTL = 1 * 60 * 1000; // 1分钟 - 短期缓存

  // 进行中的请求（去重）
  private pendingChecks = new Map<string, Observable<boolean>>();

  // 多标签页同步
  private broadcastChannel: BroadcastChannel | null = null;

  constructor() {
    this.initBroadcastChannel();
  }

  // 初始化 BroadcastChannel
  private initBroadcastChannel() {
    if (typeof BroadcastChannel !== 'undefined') {
      this.broadcastChannel = new BroadcastChannel('permission-cache-sync');
      this.broadcastChannel.onmessage = (event) => {
        if (event.data.type === 'invalidate') {
          this.invalidateCache(event.data.keys);
        }
      };
    }
  }

  // 单个权限检查（带短期缓存）
  checkPermissionWithCache(
    resource: string,
    action: string
  ): Observable<boolean> {
    const cacheKey = `${resource}:${action}`;

    // 检查缓存
    const cached = this.getFromCache(cacheKey);
    if (cached !== null) {
      return of(cached);
    }

    // 检查是否有进行中的请求
    if (this.pendingChecks.has(cacheKey)) {
      return this.pendingChecks.get(cacheKey)!;
    }

    // 发起新请求
    const request$ = this.performPermissionCheck(resource, action, cacheKey);
    this.pendingChecks.set(cacheKey, request$);

    return request$.pipe(
      finalize(() => this.pendingChecks.delete(cacheKey))
    );
  }

  // 批量权限检查（优化）
  checkPermissionsBatch(
    checks: Array<{ resource: string; action: string }>
  ): Observable<Map<string, boolean>> {
    const results = new Map<string, boolean>();
    const uncachedChecks: Array<{ resource: string; action: string; key: string }> = [];

    // 先查缓存
    checks.forEach(({ resource, action }) => {
      const key = `${resource}:${action}`;
      const cached = this.getFromCache(key);

      if (cached !== null) {
        results.set(key, cached);
      } else {
        uncachedChecks.push({ resource, action, key });
      }
    });

    // 批量API调用
    if (uncachedChecks.length > 0) {
      return this.performBatchCheck(uncachedChecks).pipe(
        map(batchResults => {
          batchResults.forEach((value, key) => {
            results.set(key, value);
          });
          return results;
        })
      );
    }

    return of(results);
  }

  // 私有方法：从缓存获取
  private getFromCache(key: string): boolean | null {
    const cached = this.permissionsCache.get(key);
    if (!cached) return null;

    // 检查是否过期
    if (Date.now() - cached.timestamp > this.CACHE_TTL) {
      this.permissionsCache.delete(key);
      return null;
    }

    return cached.value;
  }

  // 私有方法：执行权限检查（始终调用后端）
  private performPermissionCheck(
    resource: string,
    action: string,
    cacheKey: string
  ): Observable<boolean> {
    // 始终从后端获取权限，后端是唯一来源
    return this.userApiService.checkRoutePermission(
      `${resource}/${action}`,
      undefined
    ).pipe(
      map(response => response.hasPermission),
      tap(hasPermission => {
        // 更新短期缓存
        this.permissionsCache.set(cacheKey, {
          value: hasPermission,
          timestamp: Date.now()
        });
      }),
      catchError(() => of(false)) // 失败时返回 false，不暴露错误
    );
  }

  // 私有方法：执行批量检查
  private performBatchCheck(
    checks: Array<{ resource: string; action: string; key: string }>
  ): Observable<Map<string, boolean>> {
    return this.userApiService.checkBatchRoutePermissions(
      checks.map(c => `${c.resource}/${action}`)
    ).pipe(
      map(response => {
        const results = new Map<string, boolean>();
        response.results.forEach(result => {
          const check = checks.find(c => c.key === result.routePath);
          if (check) {
            results.set(check.key, result.hasPermission);
            // 更新缓存
            this.permissionsCache.set(check.key, {
              value: result.hasPermission,
              timestamp: Date.now()
            });
          }
        });
        return results;
      }),
      catchError(() => of(new Map())) // 失败时返回空 Map
    );
  }

  // 清除缓存
  clearCache(): void {
    this.permissionsCache.clear();
    this.notifyCacheInvalidation();
  }

  // 使特定缓存失效
  invalidateCache(keys?: string[]): void {
    if (keys) {
      keys.forEach(key => this.permissionsCache.delete(key));
    } else {
      this.permissionsCache.clear();
    }
  }

  // 通知其他标签页缓存失效
  private notifyCacheInvalidation(keys?: string[]) {
    if (this.broadcastChannel) {
      this.broadcastChannel.postMessage({
        type: 'invalidate',
        keys
      });
    }
  }

  ngOnDestroy() {
    if (this.broadcastChannel) {
      this.broadcastChannel.close();
    }
  }
}
```

#### 任务2.2：更新 PermissionService 简化为后端调用

**修改文件**：`src/app/services/permission.service.ts`

**改动**：

```typescript
export class PermissionService {
  private userApiService = inject(UserApiService);
  private permissionCache = inject(PermissionCacheService);

  // ✅ 权限检查始终从后端获取，后端是唯一来源
  checkRoutePermission(routePath: string, userId?: number): Observable<boolean> {
    // 通过缓存服务（短期缓存优化，但始终调用后端）
    const [resource, action] = this.extractResourceAndAction(routePath);
    return this.permissionCache.checkPermissionWithCache(resource, action);
  }

  // ✅ 批量权限检查，从后端获取
  checkBatchRoutePermissions(routes: string[], userId?: number): Observable<{
    routePath: string;
    hasPermission: boolean;
  }[]> {
    const checks = routes.map(route => {
      const [resource, action] = this.extractResourceAndAction(route);
      return { resource, action };
    });

    return this.permissionCache.checkPermissionsBatch(checks).pipe(
      map(results => {
        return routes.map(route => ({
          routePath: route,
          hasPermission: results.get(route) || false
        }));
      })
    );
  }

  // 私有方法：从路径提取资源和操作
  private extractResourceAndAction(routePath: string): [string, string] {
    const parts = routePath.split('/').filter(Boolean);
    const resource = parts[0] || 'unknown';
    const action = parts[1] || 'read';
    return [resource, action];
  }

  // ❌ 移除 hasPermission 等本地权限检查方法
  // 权限检查必须通过后端 API，后端是权限的唯一来源
}
```

---

### 阶段3：类型安全的权限常量 (高优先级)

#### 目标
创建完全类型安全的权限常量，避免字符串硬编码错误。

#### 任务3.1：创建权限常量

**新建文件**：`src/app/core/constants/permissions.constants.ts`

**内容**：

```typescript
// 权限资源枚举
export enum PermissionResource {
  USER = 'user',
  CONFIG = 'config',
  MONITORING = 'monitoring',
  INCIDENT = 'incident',
  SERVICE = 'service',
  REPORT = 'report',
}

// 权限操作枚举
export enum PermissionAction {
  READ = 'read',
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  EXPORT = 'export',
  IMPORT = 'import',
  APPROVE = 'approve',
  REJECT = 'reject',
}

// 权限 ID 常量
export const PERMISSIONS = {
  // 用户权限
  USER: {
    READ: `${PermissionResource.USER}:${PermissionAction.READ}`,
    CREATE: `${PermissionResource.USER}:${PermissionAction.CREATE}`,
    UPDATE: `${PermissionResource.USER}:${PermissionAction.UPDATE}`,
    DELETE: `${PermissionResource.USER}:${PermissionAction.DELETE}`,
    EXPORT: `${PermissionResource.USER}:${PermissionAction.EXPORT}`,
  },
  // 配置权限
  CONFIG: {
    READ: `${PermissionResource.CONFIG}:${PermissionAction.READ}`,
    MANAGE: `${PermissionResource.CONFIG}:manage`,
  },
  // 监控权限
  MONITORING: {
    READ: `${PermissionResource.MONITORING}:${PermissionAction.READ}`,
    MANAGE: `${PermissionResource.MONITORING}:manage`,
  },
} as const;

// 类型安全的权限 ID 类型
export type PermissionId = typeof PERMISSIONS[keyof typeof PERMISSIONS][keyof typeof PERMISSIONS[keyof typeof PERMISSIONS]];

// 角色常量
export const ROLES = {
  ADMIN: 'admin',
  MANAGER: 'manager',
  USER: 'user',
  GUEST: 'guest',
} as const;

export type RoleId = typeof ROLES[keyof typeof ROLES];

// 角色权限映射（仅用于文档和测试，实际权限由后端管理）
export const ROLE_PERMISSIONS: Record<RoleId, PermissionId[]> = {
  [ROLES.ADMIN]: Object.values(PERMISSIONS.USER).concat(
    Object.values(PERMISSIONS.CONFIG),
    Object.values(PERMISSIONS.MONITORING)
  ),
  [ROLES.MANAGER]: [
    PERMISSIONS.USER.READ,
    PERMISSIONS.USER.CREATE,
    PERMISSIONS.USER.UPDATE,
    PERMISSIONS.CONFIG.READ,
    PERMISSIONS.MONITORING.READ,
  ],
  [ROLES.USER]: [
    PERMISSIONS.USER.READ,
  ],
  [ROLES.GUEST]: [],
};
```

#### 任务3.2：更新使用权限的地方

**修改示例**：

```typescript
// 之前：
if (permissionService.hasPermission('user', 'read')) { ... }

// 之后：
import { PermissionResource, PermissionAction } from '../../core/constants/permissions.constants';

if (permissionService.hasPermission(
  PermissionResource.USER,
  PermissionAction.READ
)) { ... }

// 或使用权限 ID：
import { PERMISSIONS } from '../../core/constants/permissions.constants';

if (permissionFacade.hasPermissionSignal(
  PermissionResource.USER,
  PermissionAction.READ
)()) { ... }
```

---

### 阶段4：权限审计日志 (高优先级)

#### 目标
实现权限审计功能，记录所有权限检查和访问尝试，便于安全审计和问题排查。

#### 任务4.1：创建 PermissionAuditService

**新建文件**：`src/app/core/services/permission-audit.service.ts`

**核心功能**：
- 记录权限检查
- 记录路由访问
- 记录权限拒绝
- 审计日志管理

```typescript
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { isDevMode } from '@angular/core';
import { PermissionFacade } from '../stores/permission/permission.facade';
import { Router } from '@angular/router';

export interface AuditLog {
  timestamp: string;
  userId?: number;
  userRoles: string[];
  permission: string;
  resource: string;
  action: string;
  granted: boolean;
  context: {
    route?: string;
    component?: string;
    method?: string;
  };
}

@Injectable({ providedIn: 'root' })
export class PermissionAuditService {
  private http = inject(HttpClient);
  private permissionFacade = inject(PermissionFacade);
  private router = inject(Router);
  private auditLogs: AuditLog[] = [];
  private readonly MAX_LOGS = 100;

  // 记录权限检查
  logPermissionCheck(
    resource: string,
    action: string,
    granted: boolean,
    context?: Partial<AuditLog['context']>
  ) {
    const log: AuditLog = {
      timestamp: new Date().toISOString(),
      userId: this.permissionFacade.user()?.id,
      userRoles: this.permissionFacade.userRoles(),
      permission: `${resource}:${action}`,
      resource,
      action,
      granted,
      context: {
        route: this.router.url,
        ...context
      }
    };

    this.addToLogs(log);
    this.sendToBackend(log);
  }

  // 记录路由访问
  logRouteAccess(route: string, granted: boolean) {
    const log: AuditLog = {
      timestamp: new Date().toISOString(),
      userId: this.permissionFacade.user()?.id,
      userRoles: this.permissionFacade.userRoles(),
      permission: `route:${route}`,
      resource: 'route',
      action: 'access',
      granted,
      context: {
        route
      }
    };

    this.addToLogs(log);
    this.sendToBackend(log);
  }

  // 获取审计日志
  getAuditLogs(): AuditLog[] {
    return [...this.auditLogs];
  }

  // 导出审计日志
  exportAuditLogs(): string {
    return JSON.stringify(this.auditLogs, null, 2);
  }

  // 私有方法：添加到日志
  private addToLogs(log: AuditLog) {
    this.auditLogs.push(log);
    if (this.auditLogs.length > this.MAX_LOGS) {
      this.auditLogs.shift();
    }
  }

  // 私有方法：发送到后端
  private sendToBackend(log: AuditLog): void {
    // 开发环境只记录到控制台
    if (!isDevMode()) {
      this.http.post('/api/audit/permissions', log)
        .pipe(catchError(() => of(null)))
        .subscribe();
    } else {
      console.log('[PermissionAudit]', log);
    }
  }
}
```

#### 任务4.2：集成到 PermissionGuard 和 PermissionService

**修改文件**：
- `src/app/guards/permission.guard.ts`
- `src/app/services/permission.service.ts`

**示例集成**：

```typescript
// permission.guard.ts
export const permissionGuard = (
  requiredPermissions?: { resource: string; action: string },
  requiredRoles?: string[]
): CanActivateFn => {
  return (route, state) => {
    const permissionFacade = inject(PermissionFacade);
    const router = inject(Router);
    const store = inject(Store<AppState>);
    const auditService = inject(PermissionAuditService);

    return store.select(AuthSelectors.selectIsLoading).pipe(
      filter(isLoading => !isLoading),
      take(1),
      switchMap(() => {
        let granted = true;

        // 检查角色
        if (requiredRoles && requiredRoles.length > 0) {
          const hasRole = requiredRoles.some(role =>
            permissionFacade.hasRole(role)
          );
          if (!hasRole) {
            granted = false;
            auditService.logRouteAccess(state.url, granted);
            return of(router.createUrlTree(['/no-permission']));
          }
        }

        // 检查权限
        if (requiredPermissions) {
          const hasPermission = permissionFacade.hasPermission(
            requiredPermissions.resource,
            requiredPermissions.action
          );
          if (!hasPermission) {
            granted = false;
            auditService.logRouteAccess(state.url, granted);
            return of(router.createUrlTree(['/no-permission']));
          }
        }

        auditService.logRouteAccess(state.url, granted);
        return of(true);
      })
    );
  };
};
```

---

### 阶段5：无权限页面和错误处理 (中优先级)

#### 目标
创建统一的无权限页面和权限错误处理，提升用户体验。

#### 任务5.1：创建无权限页面

**新建文件**：
- `src/app/pages/no-permission/no-permission.component.ts`
- `src/app/pages/no-permission/no-permission.component.html`
- `src/app/pages/no-permission/no-permission.component.css`

**核心功能**：
- 显示友好的无权限提示
- 提供返回首页或联系管理员的操作
- 记录访问日志

```typescript
// no-permission.component.ts
import { Component, ChangeDetectionStrategy } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-no-permission',
  standalone: true,
  template: `
    <div class="no-permission-container">
      <nz-result
        nzStatus="403"
        nz nzTitle="访问受限"
        [nzSubTitle]="subTitle"
      >
        <div nz-result-extra>
          <button nz-button nzType="primary" (click)="goHome()">
            返回首页
          </button>
          <button nz-button (click)="goBack()">
            返回上页
          </button>
        </div>
      </nz-result>
    </div>
  `,
  styles: [`
    .no-permission-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      padding: 24px;
    }
    nz-result {
      width: 100%;
      max-width: 500px;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NoPermissionComponent {
  private router = inject(Router);

  readonly subTitle = '您没有访问此页面的权限，如需帮助请联系管理员。';

  goHome() {
    this.router.navigate(['/home']);
  }

  goBack() {
    if (window.history.length > 1) {
      window.history.back();
    } else {
      this.router.navigate(['/home']);
    }
  }
}
```

#### 任务5.2：统一权限错误处理

**修改文件**：`src/app/core/services/permission.service.ts`

**核心功能**：
- 统一权限错误格式
- 提供友好的错误消息
- 集成审计日志

```typescript
export class PermissionError extends Error {
  constructor(
    message: string,
    public resource: string,
    public action: string,
    public userId?: number
  ) {
    super(message);
    this.name = 'PermissionError';
  }
}

export class PermissionService {
  private userApiService = inject(UserApiService);
  private permissionCache = inject(PermissionCacheService);
  private auditService = inject(PermissionAuditService);
  private permissionFacade = inject(PermissionFacade);

  checkRoutePermission(routePath: string, userId?: number): Observable<boolean> {
    const [resource, action] = this.extractResourceAndAction(routePath);

    return this.permissionCache.checkPermissionWithCache(resource, action).pipe(
      tap(hasPermission => {
        // 记录审计日志
        this.auditService.logPermissionCheck(resource, action, hasPermission, {
          method: 'checkRoutePermission'
        });
      })
    );
  }

  // 带错误处理的权限检查
  checkRoutePermissionWithError(routePath: string, userId?: number): Observable<boolean> {
    return this.checkRoutePermission(routePath, userId).pipe(
      map(hasPermission => {
        if (!hasPermission) {
          throw new PermissionError(
            `Permission denied: ${routePath}`,
            ...this.extractResourceAndAction(routePath),
            this.permissionFacade.user()?.id
          );
        }
        return true;
      })
    );
  }
}
```

---

### 阶段6：测试和文档 (中优先级)

#### 目标
编写完整的测试用例和更新文档，确保权限系统稳定可靠。

#### 任务6.1：编写单元测试

**测试文件**：
- `src/app/core/stores/permission/permission.facade.spec.ts`
- `src/app/core/services/permission-cache.service.spec.ts`
- `src/app/core/services/permission-audit.service.spec.ts`
- `src/app/guards/permission.guard.spec.ts`

#### 任务6.2：编写 E2E 测试

**使用 webapp-testing skill**：
- 测试路由权限守卫
- 测试权限指令和管道
- 测试无权限页面
- 测试权限审计日志

#### 任务6.3：更新文档

**更新文件**：
- `permission.md` - 更新架构说明
- `spec.md` - 更新开发规范
- README.md - 添加权限系统使用指南

---

## 实施时间线

### 第1周：NgRx + Signals 混合架构 ✅
- ✅ 任务1.1：创建 Permission Facade
- ✅ 任务1.2：更新守卫使用 Facade
- ✅ 任务1.3：重构组件使用 Signals
- ✅ 编写单元测试
- ✅ 集成测试验证


### 第2周：智能权限缓存
- ⏳ 任务2.1：创建 PermissionCacheService
- ⏳ 任务2.2：更新 PermissionService 使用缓存
- ⏳ 性能测试和对比
- ⏳ 缓存策略调优

### 第3周：类型安全和审计
- ⏳ 任务3.1：创建权限常量
- ⏳ 任务3.2：更新使用权限的地方
- ⏳ 任务4.1：创建 PermissionAuditService
- ⏳ 任务4.2：集成到守卫和服务
- ⏳ 审计功能测试

### 第4周：无权限页面和测试
- ⏳ 任务5.1：创建无权限页面
- ⏳ 任务5.2：统一权限错误处理
- ⏳ 任务6.1：编写单元测试
- ⏳ 任务6.2：编写 E2E 测试
- ⏳ 任务6.3：更新文档

---

## 风险评估

### 技术风险
1. **Signals 与 NgRx 集成复杂性**：需要仔细设计状态同步
2. **缓存一致性**：多标签页缓存同步问题
3. **性能回归**：权限检查逻辑复杂化可能影响性能
4. **向后兼容性**：确保现有功能不受影响

### 缓解措施
1. **渐进式迁移**：分阶段实施，每阶段充分测试
2. **功能开关**：新功能可配置启用/禁用
3. **性能监控**：添加权限检查性能指标
4. **回滚计划**：每个阶段都有回滚方案

---

## 成功标准

### 性能标准
- ✅ 权限检查响应时间 < 50ms（缓存命中）
- ✅ 批量权限检查性能提升 50%
- ✅ API 调用次数减少 60%

### 安全标准
- ✅ 所有权限检查都有审计日志
- ✅ 无绕过权限检查的代码路径
- ✅ 权限拒绝率监控
- ✅ 通过安全扫描

### 代码质量标准
- ✅ 测试覆盖率 > 85%
- ✅ TypeScript 严格模式无错误
- ✅ ESLint 无警告
- ✅ 权限常量使用率 100%

### 用户体验标准
- ✅ 权限检查无感知延迟
- ✅ 无权限提示友好
- ✅ 权限变更实时生效

---

## 依赖项
- Angular v21+ (已满足)
- NgRx v17+ (已满足)
- RxJS v7+ (已满足)
- 测试框架：Jest + Playwright

---

## 监控指标

### 性能指标
1. **权限检查响应时间**：P50, P95, P99
2. **缓存命中率**：缓存命中 / 总检查次数
3. **API 调用次数**：权限相关的 API 调用
4. **批量检查效率**：批量 vs 单次检查对比

### 安全指标
1. **权限拒绝次数**：按资源、操作、角色统计
2. **异常访问尝试**：可疑的权限检查模式
3. **审计日志大小**：日志增长趋势

### 用户体验指标
1. **权限检查延迟感知**：用户感知的延迟
2. **无权限页面访问次数**：权限不足导致的页面跳转
3. **权限加载时间**：登录后权限加载耗时

---

## 回滚计划

### 触发条件
- 权限检查失败率 > 1%
- 性能下降超过 20%
- 核心功能回归
- 安全测试未通过

### 回滚步骤
1. 禁用新的权限守卫
2. 恢复旧的权限检查逻辑
3. 清除权限缓存
4. 重新部署验证

---

**最后更新: 2026-02-25**
**负责人: 前端团队**
**参考文档: permission.md, spec.md**

---

## 执行状态记录

### 已完成任务

#### 2026-02-25
- ✅ **第1周：NgRx + Signals 混合架构** - 全部完成
  - ✅ 任务1.1：创建 Permission Facade
  - ✅ 任务1.2：更新守卫使用 Facade
  - ✅ 任务1.3：重构组件使用 Signals
  - ✅ 编写单元测试 (PermissionFacade: 22个测试, Guards: 8个测试)
  - ✅ 集成测试验证 (构建通过，核心功能验证)

  **主要成就**:
  - 实现 PermissionFacade 作为统一权限访问点
  - 守卫、管道、指令全部迁移到 Facade
  - NgRx + Signals 混合状态管理
  - 完整的单元测试覆盖
  - 类型安全的权限检查
