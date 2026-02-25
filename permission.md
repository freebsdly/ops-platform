# 权限架构文档

## 概述

本项目采用平台级的权限管理架构，支持基于角色（RBAC）和基于资源（Resource-Based）的混合权限模型。**权限数据完全由后端管理，前端仅作为客户端展示和检查工具，后端是权限的唯一来源**。权限系统通过多层防护确保系统安全，包括路由守卫、指令控制、管道过滤和API权限验证。

## 核心权限模型

### 1. 权限定义

**位置**: `src/app/core/types/permission.interface.ts`

```typescript
export interface Permission {
  id: string;                      // 权限唯一标识
  name: string;                    // 权限名称
  type: 'menu' | 'operation' | 'data'; // 权限类型
  resource: string;                // 资源标识（如：'user', 'config', 'monitoring'）
  action: string[];                // 操作类型（如：['read', 'create', 'update', 'delete']）
  description?: string;             // 权限描述
}

export interface Role {
  id: string;                      // 角色唯一标识
  name: string;                    // 角色名称
  description?: string;            // 角色描述
  permissions: string[];          // 权限ID列表
}
```

### 2. 菜单权限

**位置**: `src/app/core/types/menu-permission.interface.ts`

```typescript
export interface MenuPermission {
  menuId: string;                  // 菜单ID，对应MENUS_CONFIG中的key或link
  resource: string;                // 资源标识
  action: string[];                // 操作权限
  requiredRoles?: string[];        // 需要的角色ID列表
}

export interface ApiMenuResponse {
  menus: Array<{
    id: string;                    // 菜单ID
    key?: string;                  // 国际化key
    path: string;                  // 路由路径
    permission?: MenuPermission;   // 权限配置
    visible: boolean;              // 是否可见
  }>;
}
```

### 3. 用户权限模型

**位置**: `src/app/core/types/user.interface.ts`

```typescript
export interface User {
  id: number;
  username: string;
  email: string;
  name: string;
  avatar?: string;
  roles: string[];                  // 角色ID列表
  permissions: Permission[];       // 详细权限列表（从后端获取）
  menuPermissions?: MenuPermission[]; // 菜单权限列表
}
```

## 权限管理服务

### PermissionService

**位置**: `src/app/services/permission.service.ts`

核心权限管理服务，提供权限检查、权限加载和权限同步功能。

#### 主要功能

| 方法 | 功能描述 |
|------|----------|
| `getUserPermissions(userId)` | 获取用户权限列表 |
| `getUserMenuPermissions(userId)` | 获取用户菜单权限列表 |
| `hasPermission(resource, action)` | 检查是否拥有指定权限 |
| `hasRole(roleId, user)` | 检查是否拥有指定角色 |
| `hasAnyPermission(permissions)` | 检查是否拥有任意一个指定权限 |
| `hasAllPermissions(permissions)` | 检查是否拥有所有指定权限 |
| `checkRoutePermission(routePath, userId)` | 检查路由访问权限 |
| `checkBatchRoutePermissions(routes, userId)` | 批量检查路由权限 |
| `syncPermissionsWithApi()` | 同步本地权限与API权限 |
| `preloadPermissions()` | 预加载用户权限（应用启动时调用） |

#### 权限检查策略

**重要原则：后端是权限的唯一来源**

1. **API 检查**: 所有权限检查通过后端 API 进行
`src/app/services/permission.service.ts:75-84`

2. **短期缓存**: 为性能优化，可使用短期缓存（TTL 1分钟），但始终以后端为权威
`src/app/services/permission.service.ts:76-84`

3. **批量优化**: 支持批量权限检查，减少API调用次数
`src/app/services/permission.service.ts:247-259`

4. **无本地权限存储**: 前端不持久化权限数据，权限变更实时从后端获取

### MenuPermissionMapperService

**位置**: `src/app/core/services/menu-permission-mapper.service.ts`

菜单权限映射服务，负责将菜单配置映射为权限配置，并过滤用户可访问的菜单。

#### 主要功能

| 方法 | 功能描述 |
|------|----------|
| `mapMenuToPermission(menuItem)` | 将菜单配置映射为权限配置 |
| `hasMenuAccess(user, menuItem)` | 验证用户是否有菜单访问权限 |
| `filterMenusByUserAccess(menus, user)` | 根据用户权限过滤菜单列表 |
| `getUserAccessibleRoutes(menus, user)` | 获取用户有权限的所有路由路径 |
| `hasRouteAccess(routePath, menus, user)` | 检查用户是否有特定路由的访问权限 |

#### 权限检查层次

1. **角色检查**: 首先检查用户角色是否满足要求
`src/app/core/services/menu-permission-mapper.service.ts:66-71`

2. **细粒度权限检查**: 检查用户是否拥有资源操作权限
`src/app/core/services/menu-permission-mapper.service.ts:74-82`

3. **菜单权限检查**: 检查用户是否有特定菜单访问权限
`src/app/core/services/menu-permission-mapper.service.ts:85-95`

## 权限状态管理

### NgRx + Signals 混合架构

**位置**: `src/app/core/stores/auth/`

权限状态采用 NgRx + Signals 混合架构管理，确保权限数据的一致性。NgRx 用于复杂状态管理和副作用，Signals 用于组件级状态提升开发体验和性能。

#### 状态结构

```typescript
// src/app/core/stores/auth/auth.reducer.ts
export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  permissions: Permission[];      // 用户权限列表
  roles: string[];                 // 用户角色列表
}
```

#### 在组件中使用 Signals

```typescript
@Component({...})
export class MyComponent {
  // ✅ 通过 toSignal() 将 NgRx selectors 转换为 signals
  readonly permissions = toSignal(
    this.store.select(AuthSelectors.selectPermissions),
    { initialValue: [] }
  );

  readonly user = toSignal<User | null>(
    this.store.select(AuthSelectors.selectUser),
    { initialValue: null }
  );

  readonly isLoading = toSignal(
    this.store.select(AuthSelectors.selectIsLoading),
    { initialValue: false }
  );

  // ✅ 派生计算
  readonly isAuthenticated = computed(() => !!this.user());
  readonly isAdmin = computed(() => this.user()?.roles?.includes('admin') ?? false);
}
```

#### Actions

| Action | 描述 |
|--------|------|
| `loadPermissions` | 加载权限 |
| `loadPermissionsSuccess` | 加载权限成功 |
| `loadPermissionsFailure` | 加载权限失败 |
| `updatePermissions` | 更新权限 |
| `clearPermissions` | 清除权限 |
| `checkPermission` | 检查权限 |

## 路由权限守护

### 1. AuthGuard

**位置**: `src/app/guards/auth.guard.ts`

认证守卫，检查用户是否已登录。

```typescript
canActivate(route, state): boolean
```

**检查逻辑**:
1. 检查是否有有效的认证令牌
2. 已认证：允许访问
3. 未认证：重定向到登录页，并记录返回URL

### 2. PermissionGuard

**位置**: `src/app/guards/permission.guard.ts`

权限守卫，检查用户是否拥有特定路由或资源的访问权限。

```typescript
canActivate(route, state): Observable<boolean> | boolean
```

**检查流程**:
1. 等待认证状态加载完成
2. 检查路由数据中的权限要求
3. 调用后端 API 进行权限验证（后端是唯一来源）
4. 无权限时重定向到 `/no-permission` 页面

**权限检查策略**:
- 始终调用后端 API 进行权限验证最终检查
- 可使用短期缓存优化性能，但以后端为准
`src/app/guards/permission.guard.ts:73-112`

### 3. RoleGuard

**位置**: `src/app/guards/role.guard.ts`

角色守卫，检查用户是否拥有指定角色。

```typescript
canActivate(route, state): Observable<boolean> | boolean
```

**使用方式**:
```typescript
{
  path: 'admin',
  canActivate: [RoleGuard],
  data: { roles: ['admin', 'superadmin'] }
}
```

### 4. LoginGuard

**位置**: `src/app/guards/login.guard.ts`

登录守卫，防止已登录用户访问登录页面。

### 5. RootRedirectGuard

**位置**: `src/app/guards/root-redirect.guard.ts`

根路径重定向守卫，根据用户状态重定向到合适的页面。

## 权限控制指令和管道

### 1. PermissionDirective

**位置**: `src/app/core/directives/permission.directive.ts`

根据权限控制元素的显示/隐藏。

**使用方式**:
```html
<button
  permission
  [permissionResource]="'user'"
  [permissionAction]="'create'"
>
  创建用户
</button>
```

### 2. HasPermissionPipe

**位置**: `src/app/core/pipes/has-permission.pipe.ts`

权限检查管道，用于条件渲染。

**使用方式**:
```html
<div *ngIf="'user' | hasPermission:'read'">
  用户列表
</div>
```

### 3. HasRolePipe

**位置**: `src/app/core/pipes/has-role.pipe.ts`

角色检查管道，用于基于角色的条件渲染。

## API权限接口

**位置**: `src/app/core/services/user-api.service.ts`

### 权限相关API

| API路径 | 功能描述 |
|---------|----------|
| `GET /api/users/{userId}/permissions` | 获取用户权限列表 |
| `GET /api/user/menu-permissions` | 获取用户菜单权限列表 |
| `GET /api/user/accessible-menus` | 获取用户可访问的菜单 |
| `POST /api/permissions/check-route` | 检查路由权限 |
| `POST /api/permissions/check-batch-routes` | 批量检查路由权限 |
| `POST /api/permissions/check` | 检查用户权限 |

### API响应类型

**路由权限检查响应**:
```typescript
export interface RoutePermissionCheckResponse {
  hasPermission: boolean;
  requiredPermission?: {
    menuId: string;
    resource: string;
    action: string[];
    requiredRoles?: string[];
  };
  userPermission?: {
    menuId: string;
    resource: string;
    action: string[];
    requiredRoles?: string[];
  };
}
```

## 菜单权限配置

### 菜单配置结构

**位置**: `src/app/config/menu.config.ts`

```typescript
export interface MenuItem {
  key: string;                     // 国际化键值
  text: string;                    // 显示文本
  icon: string;                    // 图标
  link?: string;                   // 路由链接
  children?: MenuItem[];            // 子菜单
  permission?: {                   // 权限配置
    resource: string;
    action: string;
  };
  roles?: string[];                // 允许访问的角色ID列表
  visible?: boolean;               // 是否可见
}
```

### 权限配置示例

```typescript
{
  key: 'CONFIG.MODEL_MANAGEMENT',
  text: '模型管理',
  icon: 'appstore',
  link: '/configuration/management/model',
  permission: {
    resource: 'configuration',
    action: 'read'
  },
  roles: ['admin', 'config_manager']
}
```

## 权限检查流程

### 1. 路由访问检查

```
用户访问路由
  ↓
AuthGuard 检查认证
  ↓ (已认证)
PermissionGuard 检查权限
  ↓
从路由数据获取权限要求
  ↓
调用后端 API 验证权限（后端是唯一来源）
  ↓
有权限 → 允许访问
无权限 → 重定向到无权限页面
```

### 2. 菜单过滤流程

```
加载菜单配置
  ↓
获取当前用户
  ↓
MenuPermissionMapperService 过滤菜单
  ↓
检查每个菜单项:
  - 角色权限
  - 资源权限
  - 菜单权限
  ↓
递归过滤子菜单
  ↓
返回用户可访问的菜单列表
```

### 3. 元素权限控制流程

```
模板渲染
  ↓
PermissionDirective / HasPermissionPipe
  ↓
调用后端 API 检查权限（或使用短期缓存）
  ↓
有权限 → 显示元素
无权限 → 隐藏元素
```

## 权限数据流

### 登录流程权限加载

```
用户登录
  ↓
AuthService.login()
  ↓
后端返回用户信息（不包含详细权限，权限需通过 API 获取）
  ↓
更新 AuthStore (user)
  ↓
权限检查时动态调用后端 API
  ↓
权限数据实时验证
```

### 应用启动权限预加载

```
App 初始化
  ↓
权限检查时按需调用后端 API
  ↓
短期缓存优化性能（TTL 1分钟）
  ↓
权限变更实时从后端获取
```

## 安全最佳实践

### 1. 防御性编程

- **多层防护**: 路由守卫 + 指令控制 + API权限验证
- **默认拒绝**: 未明确授权的资源默认拒绝访问
- **后端唯一来源**: 所有权限决策由后端完成，前端仅展示

### 2. 权限隔离

- **角色隔离**: 不同角色拥有不同的权限集
- **资源隔离**: 不同资源的权限独立管理
- **操作隔离**: 细粒度到操作级别的权限控制

### 3. 安全存储

- **令牌安全**: 使用 `SecureTokenService` 管理认证令牌
- **会话级别**: 敏感信息存储在 session 中，避免XSS攻击
- **权限不持久化**: 权限数据不存储在前端，始终从后端获取

## 扩展指南

### 添加新的权限类型

1. 在 `permission.interface.ts` 中定义新的权限类型
2. 在 API 服务中添加对应的权限检查接口
3. 在 `PermissionService` 中添加权限检查方法
4. 更新 Mock 数据以支持新权限类型

### 自定义权限守卫

```typescript
import { Injectable, inject } from '@angular/core';
import { CanActivate } from '@angular/router';
import { PermissionService } from '../../services/permission.service';

@Injectable({ providedIn: 'root' })
export class CustomPermissionGuard implements CanActivate {
  private permissionService = inject(PermissionService);

  canActivate(route, state) {
    // 自定义权限检查逻辑
    return this.permissionService.hasPermission('resource', 'action');
  }
}
```

### 添加权限指令

```typescript
import { Directive, Input, inject } from '@angular/core';
import { PermissionService } from '../../services/permission.service';

@Directive({
  selector: '[customPermission]',
  standalone: true,
})
export class CustomPermissionDirective {
  private permissionService = inject(PermissionService);

  @Input('customPermission') permissionConfig: string;

  ngOnInit() {
    // 自定义权限控制逻辑
  }
}
```

## 常见问题

### Q1: 权限检查在哪里执行？

A: 权限检查在多个层次执行：
- 路由守卫：保护路由访问
- 指令和管道：控制UI元素显示
- API拦截器：验证API请求权限
- 组件逻辑：业务功能权限控制

### Q2: 如何调试权限问题？

A:
1. 检查用户角色和权限数据
2. 确认路由配置中的权限要求
3. 查看控制台日志，权限守卫会输出检查结果
4. 使用 Angular DevTools 检查 NgRx 状态

### Q3: 权限数据如何更新？

A:
- 登录时自动加载权限数据
- 可通过 `PermissionService.syncPermissionsWithApi()` 手动同步
- 权限变更通过 NgRx Actions 更新状态

## 相关文件清单

### 核心文件

| 文件路径 | 功能描述 |
|----------|----------|
| `src/app/services/permission.service.ts` | 权限管理服务 |
| `src/app/core/services/menu-permission-mapper.service.ts` | 菜单权限映射服务 |
| `src/app/core/services/user-api.service.ts` | 用户API服务 |
| `src/app/core/types/permission.interface.ts` | 权限类型定义 |
| `src/app/core/types/menu-permission.interface.ts` | 菜单权限类型定义 |
| `src/app/core/types/user.interface.ts` | 用户类型定义 |

### 守卫文件

| 文件路径 | 功能描述 |
|----------|----------|
| `src/app/guards/auth.guard.ts` | 认证守卫 |
| `src/app/guards/permission.guard.ts` | 权限守卫 |
| `src/app/guards/role.guard.ts` | 角色守卫 |
| `src/app/guards/login.guard.ts` | 登录守卫 |
| `src/app/guards/root-redirect.guard.ts` | 根路径重定向守卫 |

### 状态管理文件

| 文件路径 | 功能描述 |
|----------|----------|
| `src/app/core/stores/auth/auth.reducer.ts` | Auth状态管理 |
| `src/app/core/stores/auth/auth.actions.ts` | Auth Actions |
| `src/app/core/stores/auth/auth.selectors.ts` | Auth Selectors |
| `src/app/core/stores/auth/permission.actions.ts` | 权限 Actions |

### 指令和管道

| 文件路径 | 功能描述 |
|----------|----------|
| `src/app/core/directives/permission.directive.ts` | 权限指令 |
| `src/app/core/pipes/has-permission.pipe.ts` | 权限检查管道 |
| `src/app/core/pipes/has-role.pipe.ts` | 角色检查管道 |

### 配置文件

| 文件路径 | 功能描述 |
|----------|----------|
| `src/app/config/menu.config.ts` | 菜单权限配置 |

---

**文档版本**: 1.0.0
**最后更新**: 2026-02-24
