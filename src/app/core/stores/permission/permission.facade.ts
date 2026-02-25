import { Injectable, inject, computed } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Store } from '@ngrx/store';
import { AppState } from '../../types/app-state';
import { selectPermissions, selectUser, selectUserRoles, selectIsLoading, selectIsAuthenticated } from '../auth/auth.selectors';
import { loadPermissions, clearPermissions } from '../auth/permission.actions';
import { PermissionService } from '../../../services/permission.service';
import { Permission } from '../../types/permission.interface';
import { User } from '../../types/user.interface';

@Injectable({ providedIn: 'root' })
export class PermissionFacade {
  private store = inject(Store<AppState>);
  private permissionService = inject(PermissionService);

  // ✅ NgRx 数据源转换为 Signals
  readonly permissions = toSignal(
    this.store.select(selectPermissions),
    { initialValue: [] as Permission[] }
  );

  readonly user = toSignal(
    this.store.select(selectUser),
    { initialValue: null as User | null }
  );

  readonly userRoles = toSignal(
    this.store.select(selectUserRoles),
    { initialValue: [] as string[] }
  );

  readonly isLoading = toSignal(
    this.store.select(selectIsLoading),
    { initialValue: false }
  );

  readonly isAuthenticated = toSignal(
    this.store.select(selectIsAuthenticated),
    { initialValue: false }
  );

  // ✅ 派生计算 - 自动响应权限变更
  readonly isAdmin = computed(() => this.userRoles().includes('admin'));
  readonly canAccessAdminPanel = computed(() =>
    this.isAdmin() && this.isAuthenticated()
  );

  // ✅ 资源级别权限检查（同步，基于本地缓存权限）
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

  // ✅ 角色检查 Signal
  hasRoleSignal(roleId: string) {
    return computed(() => this.hasRole(roleId));
  }

  // ✅ 检查是否拥有任意一个指定权限
  hasAnyPermission(permissions: Array<{ resource: string; action: string }>): boolean {
    return permissions.some(({ resource, action }) =>
      this.hasPermission(resource, action)
    );
  }

  // ✅ 检查是否拥有任意一个指定权限 - Signal版本
  hasAnyPermissionSignal(permissions: Array<{ resource: string; action: string }>) {
    return computed(() => this.hasAnyPermission(permissions));
  }

  // ✅ 检查是否拥有所有指定权限
  hasAllPermissions(permissions: Array<{ resource: string; action: string }>): boolean {
    return permissions.every(({ resource, action }) =>
      this.hasPermission(resource, action)
    );
  }

  // ✅ 检查是否拥有所有指定权限 - Signal版本
  hasAllPermissionsSignal(permissions: Array<{ resource: string; action: string }>) {
    return computed(() => this.hasAllPermissions(permissions));
  }

  // ✅ 加载权限 (通过 NgRx)
  loadPermissions(userId: number) {
    this.store.dispatch(loadPermissions());
  }

  // ✅ 清除权限 (通过 NgRx)
  clearPermissions() {
    this.store.dispatch(clearPermissions());
  }

  // ✅ 检查路由权限（异步，通过 API）
  checkRoutePermission(routePath: string, userId?: number) {
    return this.permissionService.checkRoutePermission(routePath, userId);
  }

  // ✅ 批量检查路由权限
  checkBatchRoutePermissions(routes: string[], userId?: number) {
    return this.permissionService.checkBatchRoutePermissions(routes, userId);
  }

  // ✅ 获取用户可访问路由
  getUserAccessibleRoutes(userId?: number) {
    return this.permissionService.getUserAccessibleRoutes(userId);
  }

  // ✅ 预加载用户权限
  preloadPermissions() {
    return this.permissionService.preloadPermissions();
  }
}
