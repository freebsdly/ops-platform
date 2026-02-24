# DevOps Platform 优化执行计划

## 概述
基于 Angular v20+ 最佳实践和权限模型最佳实践，全面优化项目的权限架构、状态管理和性能。采用 NgRx + Signals 混合架构，在保留 NgRx 强大功能的同时，利用 Signals 提升开发体验和性能。

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
| 权限缓存 | 简单内存缓存 | **带 TTL 的智能缓存 + 请求去重** | 🔴 高 |
| 类型安全 | 部分类型安全 | **完全类型安全的权限常量** | 🟡 中 |
| 权限审计 | 未实现 | **添加权限审计日志** | 🟡 中 |
| 渐进式检查 | 未实现 | **本地快速检查 + API 響证** | 🟡 中 |
| 条件权限 | 未实现 | **支持动态条件权限** | 🟢 低 |
| 批量权限检查 | 已实现 | **优化批量检查性能** | 🟡 中 |

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
@Injectable({ providedIn: 'root' })
export class PermissionFacade {
  private store = inject(Store<AuthState>);
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

### 阶段2：智能权限缓存系统 (高优先级)

#### 目标
实现带 TTL 的智能缓存和请求去重，减少 API 调用，提升性能。

#### 任务2.1：创建 PermissionCacheService

**新建文件**：`src/app/core/services/permission-cache.service.ts`

**核心功能**：
- 权限检查结果缓存（TTL 5分钟）
- 请求去重（避免同一权限重复检查）
- 批量权限检查优化

```typescript
@Injectable({ providedIn: 'root' })
export class PermissionCacheService {
  private permissionService = inject(PermissionService);
  private userApiService = inject(UserApiService);

  // 权限检查缓存
  private permissionsCache = new Map<string, { value: boolean; timestamp: number }>();
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5分钟

  // 进行中的请求（去重）
  private pendingChecks = new Map<string, Observable<boolean>>();

  // 单个权限检查（带缓存）
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

  // 私有方法：执行权限检查
  private performPermissionCheck(
    resource: string,
    action: string,
    cacheKey: string
  ): Observable<boolean> {
    return this.permissionService.checkRoutePermission(
      `${resource}/${action}`,
      undefined
    ).pipe(
      tap(hasPermission => {
        // 更新缓存
        this.permissionsCache.set(cacheKey, {
          value: hasPermission,
          timestamp: Date.now()
        });
      })
    );
  }

  // 私有方法：执行批量检查
  private performBatchCheck(
    checks: Array<{ resource: string; action: string; key: string }>
  ): Observable<Map<string, boolean>> {
    return this.userApiService.checkBatchRoutePermissions(
      checks.map(c => `${c.resource}/${c.action}`)
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
      })
    );
  }

  // 清除缓存
  clearCache(): void {
    this.permissionsCache.clear();
  }
}
```

#### 任务2.2：更新 PermissionService 使用缓存

**修改文件**：`src/app/services/permission.service.ts`

**改动**：

```typescript
export class PermissionService {
  // 注入缓存服务
  private permissionCache = inject(PermissionCacheService);

  // 使用缓存的权限检查
  checkRoutePermission(routePath: string, userId?: number): Observable<boolean> {
    // 先尝试本地检查
    const [resource, action] = this.extractResourceAndAction(routePath);
    const localResult = this.hasPermission(resource, action);

    if (localResult) {
      return of(true);
    }

    // 使用缓存服务进行 API 检查
    return this.permissionCache.checkPermissionWithCache(resource, action);
  }

  // 批量检查使用缓存
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
}
```

---

### 阶段3：类型安全的权限常量 (中优先级)

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

// 角色权限映射
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
if (permissionService.hasPermission(
  PermissionResource.USER,
  PermissionAction.READ
)) { ... }

// 或使用权限 ID：
if (permissionFacade.hasPermissionSignal(
  PermissionResource.USER,
  PermissionAction.READ
)()) { ... }
```

---

### 阶段4：权限审计日志 (中优先级)

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
  private sendToBackend(log: AuditLog) {
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

---

### 阶段5：渐近式权限检查 (中优先级)

#### 目标
实现先本地快速检查、再异步 API 验证的渐进式检查，提升用户体验。

#### 任务5.1：更新 PermissionGuard

**修改文件**：`src/app/guards/permission.guard.ts`

**改动**：

```typescript
export const permissionGuard = (
  requiredPermissions?: { resource: string; action: string },
  requiredRoles?: string[]
): CanActivateFn => {
  return (route, state) => {
    const permissionFacade = inject(PermissionFacade);
    const router = inject(Router);
    const auditService = inject(PermissionAuditService);

    // ✅ 快速本地检查
    if (requiredRoles) {
      const hasRole = requiredRoles.some(role =>
        permissionFacade.hasRole(role)
      );
      if (hasRole) {
        auditService.logRouteAccess(state.url, true);
        return of(true);
      }
    }

    if (requiredPermissions) {
      const hasPermission = permissionFacade.hasPermission(
        requiredPermissions.resource,
        requiredPermissions.action
      );
      if (hasPermission) {
        auditService.logRouteAccess(state.url, true);
        return of(true);
      }
    }

    // ✅ 本地检查失败，异步 API 验证
    return permissionFacade.checkRoutePermission(state.url).pipe(
      tap(hasPermission => {
        auditService.logRouteAccess(state.url, hasPermission);
      }),
      map(hasPermission => {
        if (!hasPermission) {
          return router.createUrlTree(['/no-permission']);
        }
        return true;
      })
    );
  };
};
```

---

### 阶段6：条件权限支持 (低优先级)

#### 目标
支持基于用户属性、资源属性、环境等动态条件的权限判断。

#### 任务6.1：扩展权限模型

**修改文件**：`src/app/core/types/permission.interface.ts`

**改动**：

```typescript
export interface PermissionCondition {
  type: 'attribute' | 'custom' | 'role';
  key?: string;
  operator?: 'eq' | 'in' | 'gt' | 'lt' | 'custom';
  value?: any;
  evaluateFn?: (user: User, resource?: any) => boolean;
}

export interface Permission {
  id: string;
  name: string;
  type: 'menu' | 'operation' | 'data';
  resource: string;
  action: string[];
  description?: string;
  conditions?: PermissionCondition[]; // 新增：条件权限
}
```

#### 任务6.2：实现条件权限评估

**新建方法在**：`src/app/services/permission.service.ts`

```typescript
// 检查条件权限
evaluateConditions(conditions: PermissionCondition[], resource?: any): boolean {
  const user = this.getCurrentUserFromLocalStorage();

  if (!conditions || conditions.length === 0) {
    return true;
  }

  return conditions.every(condition => {
    switch (condition.type) {
      case 'attribute':
        return this.evaluateAttributeCondition(condition, user, resource);
      case 'role':
        return user.roles.includes(condition.value as string);
      case 'custom':
        return condition.evaluateFn!(user, resource);
      default:
        return true;
    }
  });
}

// 私有方法：评估属性条件
private evaluateAttributeCondition(
  condition: PermissionCondition,
  user: User,
  resource?: any
): boolean {
  const userValue = this.getNestedValue(user, condition.key!);
  const targetValue = condition.value;

  switch (condition.operator) {
    case 'eq':
      return userValue === targetValue;
    case 'in':
      return (targetValue as any[]).includes(userValue);
    case 'gt':
      return userValue > targetValue;
    case 'lt':
      return userValue <Value;
    default:
      return false;
  }
}

// 私有方法：获取嵌套属性值
private getNestedValue(obj: any, path: string): any {
  return path.split('.').reduce((current, key) => current?.[key], obj);
}
```

---

## 实施时间线

### 第1周：NgRx + Signals 混合架构
- ⏳ 任务1.1：创建 Permission Facade
- ⏳ 任务1.2：更新守卫使用 Facade
- ⏳ 任务1.3：重构组件使用 Signals
- ⏳ 编写单元测试
- ⏳ 集成测试验证

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

### 第4周：渐进式和条件权限
- ⏳ 任务5.1：更新 PermissionGuard 渐进式检查
- ⏳ 任务6.1：扩展权限模型
- ⏳ 任务6.2：实现条件权限评估
- ⏳ 全面测试和文档更新

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
- Angular v20+ (已满足)
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

*最后更新: 2026-02-24*
*负责人: 前端团队*
*参考文档: permission.md*
