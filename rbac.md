# RBAC (基于角色的访问控制) 集成改造方案

基于对当前项目结构的分析，发现RBAC实现存在以下缺失部分，需要完整的改造以实现从后端接口获取用户权限并集成到前端应用。

## RBAC集成缺失部分

### 1. 用户权限数据结构缺失
- `User`接口仅有`roles`字段，缺少具体权限字段
- 没有定义权限类型接口（菜单权限、操作权限、数据权限等）
- 缺乏权限到资源的映射关系定义

### 2. 权限服务缺失
- 没有从后端获取权限的API服务
- 缺少权限检查和验证逻辑
- 缺乏权限缓存和更新机制

### 3. 路由权限守卫缺失
- `AuthGuard`仅检查认证状态，没有权限检查
- 缺少基于角色的路由保护
- 没有细粒度权限的路由访问控制

### 4. 菜单权限过滤缺失
- `MENUS_CONFIG`配置没有权限字段
- 没有根据用户权限动态过滤菜单
- 菜单项缺少权限标识和访问控制

### 5. 操作权限指令缺失
- 没有权限指令控制按钮显示/禁用状态
- 缺少页面元素级别的权限控制
- 缺乏动态权限绑定机制

## 具体修改建议

### 1. 扩展用户和权限接口

```typescript
// 新增 permission.interface.ts
export interface Permission {
  id: string;
  name: string;
  type: 'menu' | 'operation' | 'data';
  resource: string;      // 资源标识，如：'user', 'config'
  action: string[];      // 操作类型，如：['read', 'create', 'update', 'delete']
  description?: string;
}

export interface Role {
  id: string;
  name: string;
  description?: string;
  permissions: string[]; // 权限ID列表
}

// 扩展 User 接口 (src/app/core/types/user.interface.ts)
export interface User {
  id: number;
  username: string;
  email: string;
  name: string;
  avatar?: string;
  roles: string[];          // 角色ID列表
  permissions: Permission[]; // 详细权限列表 (从后端获取)
}
```

### 2. 创建权限服务

创建 `PermissionService` 实现以下功能：

```typescript
@Injectable({ providedIn: 'root' })
export class PermissionService {
  // 获取用户权限
  getUserPermissions(userId: number): Observable<Permission[]>
  
  // 检查权限
  hasPermission(resource: string, action: string): boolean
  
  // 检查角色
  hasRole(roleId: string): boolean
  
  // 批量检查权限
  hasAnyPermission(permissions: Array<{resource: string, action: string}>): boolean
  
  // 权限变更监听
  permissionsChanged$: Observable<Permission[]>
}
```

### 3. 实现角色和权限守卫

创建 `RoleGuard` 和 `PermissionGuard`：

```typescript
@Injectable({ providedIn: 'root' })
export class RoleGuard implements CanActivate {
  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean | Observable<boolean> {
    const requiredRoles = route.data['roles'] as string[];
    const userRoles = this.store.select(authSelectors.getUserRoles);
    
    return userRoles.pipe(
      map(roles => requiredRoles.some(role => roles.includes(role)))
    );
  }
}

@Injectable({ providedIn: 'root' })
export class PermissionGuard implements CanActivate {
  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean | Observable<boolean> {
    const requiredPermission = route.data['permission'] as {
      resource: string;
      action: string;
    };
    
    return this.permissionService.hasPermission(
      requiredPermission.resource,
      requiredPermission.action
    );
  }
}
```

### 4. 增强菜单配置

为 `MenuItem` 接口添加权限字段：

```typescript
// 修改 menu.config.ts 中的 MenuItem 接口
export interface MenuItem {
  key: string;
  text: string;
  icon: string;
  link?: string;
  children?: MenuItem[];
  open?: boolean;
  // 新增权限控制字段
  permission?: {
    resource: string;
    action: string;
  };
  roles?: string[]; // 允许访问的角色
  visible?: boolean | (() => boolean); // 可见性控制
}

// 创建菜单过滤服务
@Injectable({ providedIn: 'root' })
export class MenuFilterService {
  filterByPermissions(menus: MenuItem[], permissions: Permission[]): MenuItem[]
}
```

### 5. 创建权限指令和管道

```typescript
// 权限指令
@Directive({
  selector: '[permission]'
})
export class PermissionDirective {
  @Input() permissionResource!: string;
  @Input() permissionAction!: string;
  
  ngOnInit() {
    const hasPermission = this.permissionService.hasPermission(
      this.permissionResource,
      this.permissionAction
    );
    
    if (!hasPermission) {
      this.renderer.setStyle(this.elementRef.nativeElement, 'display', 'none');
    }
  }
}

// 权限管道
@Pipe({ name: 'hasPermission' })
export class HasPermissionPipe implements PipeTransform {
  transform(value: unknown, resource: string, action: string): boolean {
    return this.permissionService.hasPermission(resource, action);
  }
}
```

### 6. 扩展Store状态管理

```typescript
// 扩展 auth.state.ts
export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  // 新增
  permissions: Permission[];
  roles: string[];
}

// 新增权限相关actions
export const loadPermissions = createAction('[Permission] Load Permissions');
export const loadPermissionsSuccess = createAction(
  '[Permission] Load Permissions Success',
  props<{ permissions: Permission[] }>()
);
export const loadPermissionsFailure = createAction(
  '[Permission] Load Permissions Failure',
  props<{ error: string }>()
);

export const updatePermissions = createAction(
  '[Permission] Update Permissions',
  props<{ permissions: Permission[] }>()
);

// 新增权限effects
export class PermissionEffects {
  loadPermissions$ = createEffect(() => 
    this.actions$.pipe(
      ofType(loadPermissions),
      mergeMap(() => 
        this.permissionService.getUserPermissions().pipe(
          map(permissions => loadPermissionsSuccess({ permissions })),
          catchError(error => of(loadPermissionsFailure({ error })))
        )
      )
    )
  );
}
```

### 7. 路由配置集成

```typescript
// 在路由配置中添加权限控制
export const routes: Routes = [
  {
    path: 'configuration/management/model',
    component: ModelManagementComponent,
    canActivate: [PermissionGuard],
    data: {
      permission: { resource: 'configuration', action: 'read' },
      roles: ['admin', 'config_manager']
    }
  },
  {
    path: 'configuration/management/attribute',
    component: AttributeManagementComponent,
    canActivate: [RoleGuard],
    data: {
      roles: ['admin']
    }
  }
];
```

### 8. 集成到现有认证流程

修改 `AuthEffects` 以在登录后加载权限：

```typescript
@Injectable()
export class AuthEffects {
  // 在登录成功后加载权限
  loginSuccess$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.loginSuccess),
      map(() => PermissionActions.loadPermissions())
    )
  );
  
  // 权限加载成功后重定向
  permissionsLoaded$ = createEffect(() =>
    this.actions$.pipe(
      ofType(PermissionActions.loadPermissionsSuccess),
      tap(() => {
        // 根据权限动态选择重定向路径
        const firstAllowedPath = this.getFirstAllowedPath();
        this.router.navigate([firstAllowedPath]);
      })
    ),
    { dispatch: false }
  );
}
```

## 实施优先级

1. **第一阶段：基础架构** (高优先级)
   - 扩展用户和权限接口
   - 创建权限服务
   - 扩展Store状态

2. **第二阶段：路由和守卫** (中优先级)
   - 实现角色和权限守卫
   - 路由配置集成

3. **第三阶段：UI集成** (中优先级)
   - 创建权限指令和管道
   - 增强菜单配置和过滤

4. **第四阶段：测试和优化** (低优先级)
   - 单元测试
   - 性能优化
   - 错误处理增强

## 注意事项

1. **向后兼容**：确保现有功能不受影响
2. **性能考虑**：权限数据可能需要缓存
3. **安全性**：前端权限验证应作为辅助，主要验证在服务端
4. **用户体验**：权限不足时应提供友好的提示信息
5. **动态更新**：支持权限的动态更新和实时生效

## 后端接口预期

前端需要后端提供以下接口：

1. `GET /api/users/{userId}/permissions` - 获取用户权限列表
2. `GET /api/roles` - 获取所有角色定义
3. `POST /api/permissions/check` - 批量检查权限

权限数据格式应包含资源标识、操作类型等细粒度控制信息。