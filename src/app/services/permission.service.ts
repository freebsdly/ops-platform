import { Injectable, inject } from '@angular/core';
import { Observable, of, BehaviorSubject, forkJoin } from 'rxjs';
import { delay, catchError, map, tap } from 'rxjs/operators';
import { Permission } from '../core/types/permission.interface';
import { MenuPermission } from '../core/types/menu-permission.interface';
import { User } from '../core/types/user.interface';
import { UserApiService } from '../core/services/user-api.service';
import { MenuPermissionMapperService } from '../core/services/menu-permission-mapper.service';
import { MenuItem, MENUS_CONFIG } from '../config/menu.config';

export interface PermissionCheck {
  resource: string;
  action: string;
}

@Injectable({
  providedIn: 'root',
})
export class PermissionService {
  private userApiService = inject(UserApiService);
  private menuPermissionMapper = inject(MenuPermissionMapperService);
  
  private currentPermissions: Permission[] = [];
  private currentMenuPermissions: MenuPermission[] = [];
  private allMenuItems: MenuItem[] = this.getAllMenuItems();
  
  private permissionsSubject = new BehaviorSubject<Permission[]>([]);
  private menuPermissionsSubject = new BehaviorSubject<MenuPermission[]>([]);

  readonly permissionsChanged$ = this.permissionsSubject.asObservable();
  readonly menuPermissionsChanged$ = this.menuPermissionsSubject.asObservable();

  /**
   * 获取用户权限列表
   */
  getUserPermissions(userId: number): Observable<Permission[]> {
    return this.userApiService.getUserPermissions(userId).pipe(
      catchError(error => {
        console.error('获取用户权限失败:', error);
        // 返回空权限数组作为回退
        return of([]);
      })
    );
  }

  /**
   * 获取用户菜单权限列表
   */
  getUserMenuPermissions(userId?: number): Observable<MenuPermission[]> {
    return this.userApiService.getUserMenuPermissions(userId).pipe(
      tap(permissions => {
        this.currentMenuPermissions = permissions;
        this.menuPermissionsSubject.next(permissions);
      }),
      catchError(error => {
        console.error('获取用户菜单权限失败:', error);
        // 返回空权限数组作为回退
        return of([]);
      })
    );
  }

  /**
   * 从API加载用户菜单权限
   */
  loadUserMenuPermissions(userId: number): Observable<MenuPermission[]> {
    return this.getUserMenuPermissions(userId);
  }

  /**
   * 检查用户是否有特定路由的权限
   */
  checkRoutePermission(routePath: string, userId?: number): Observable<boolean> {
    return this.userApiService.checkRoutePermission(routePath, userId).pipe(
      map(response => response.hasPermission),
      catchError(error => {
        console.error('检查路由权限失败:', error);
        // API失败时，回退到本地权限检查
        return this.checkRoutePermissionLocally(routePath);
      })
    );
  }

  /**
   * 本地检查路由权限（API失败时的回退方案）
   */
  private checkRoutePermissionLocally(routePath: string): Observable<boolean> {
    // 模拟API响应延迟
    return of(true).pipe(
      delay(100),
      map(() => {
        // 实现本地权限检查逻辑
        // 这里可以集成现有的权限检查逻辑
        return true; // 暂时返回true，实际应根据权限配置检查
      })
    );
  }

  /**
   * 同步本地权限与API权限
   */
  syncPermissionsWithApi(): Observable<void> {
    // 加载用户权限和菜单权限
    return forkJoin({
      permissions: this.getUserPermissions(1), // TODO: 获取当前用户ID
      menuPermissions: this.getUserMenuPermissions(1)
    }).pipe(
      tap(({ permissions, menuPermissions }) => {
        this.setPermissions(permissions);
        this.setMenuPermissions(menuPermissions);
      }),
      map(() => undefined)
    );
  }

  /**
   * 设置当前用户权限（用于从Store同步）
   */
  setPermissions(permissions: Permission[]): void {
    this.currentPermissions = permissions;
    this.permissionsSubject.next(permissions);
  }

  /**
   * 设置当前用户菜单权限
   */
  setMenuPermissions(permissions: MenuPermission[]): void {
    this.currentMenuPermissions = permissions;
    this.menuPermissionsSubject.next(permissions);
  }

  /**
   * 检查是否拥有指定权限
   */
  hasPermission(resource: string, action: string): boolean {
    return this.currentPermissions.some(permission =>
      permission.resource === resource &&
      permission.action.includes(action)
    );
  }

  /**
   * 检查是否拥有指定角色
   */
  hasRole(roleId: string, user?: User): boolean {
    const targetUser = user || this.getCurrentUserFromLocalStorage();
    return targetUser?.roles.includes(roleId) || false;
  }

  /**
   * 检查是否拥有任意一个指定权限
   */
  hasAnyPermission(permissions: PermissionCheck[]): boolean {
    return permissions.some(({ resource, action }) =>
      this.hasPermission(resource, action)
    );
  }

  /**
   * 检查是否拥有所有指定权限
   */
  hasAllPermissions(permissions: PermissionCheck[]): boolean {
    return permissions.every(({ resource, action }) =>
      this.hasPermission(resource, action)
    );
  }

  /**
   * 获取指定资源的所有权限
   */
  getResourcePermissions(resource: string): Permission[] {
    return this.currentPermissions.filter(
      permission => permission.resource === resource
    );
  }

  /**
   * 检查用户是否有特定菜单的访问权限
   */
  hasMenuAccess(menuItem: MenuItem, user?: User): Observable<boolean> {
    const targetUser = user || this.getCurrentUserFromLocalStorage();
    if (!targetUser) {
      return of(false);
    }

    // 检查本地权限
    const hasAccess = this.menuPermissionMapper.hasMenuAccess(targetUser, menuItem);
    if (hasAccess) {
      return of(true);
    }

    // 本地检查失败时，可以调用API进行最终验证
    return this.userApiService.checkRoutePermission(menuItem.link || '', targetUser.id).pipe(
      map(response => response.hasPermission),
      catchError(() => of(false))
    );
  }

  /**
   * 获取所有菜单项的扁平化列表
   */
  private getAllMenuItems(): MenuItem[] {
    const items: MenuItem[] = [];
    
    const collectItems = (menuList: MenuItem[]) => {
      for (const menu of menuList) {
        items.push(menu);
        if (menu.children && menu.children.length > 0) {
          collectItems(menu.children);
        }
      }
    };
    
    Object.values(MENUS_CONFIG).forEach(moduleMenus => {
      collectItems(moduleMenus);
    });
    
    return items;
  }

  /**
   * 从localStorage获取当前用户（临时方案，实际应从Store获取）
   */
  private getCurrentUserFromLocalStorage(): User | null {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        return JSON.parse(userStr);
      } catch {
        return null;
      }
    }
    return null;
  }

  /**
   * 获取用户有权限的路由列表
   */
  getUserAccessibleRoutes(userId?: number): Observable<string[]> {
    return this.userApiService.getUserAccessibleMenus(userId).pipe(
      map(response => response.menus.filter(menu => menu.visible).map(menu => menu.path)),
      catchError(error => {
        console.error('获取用户可访问路由失败:', error);
        // 失败时返回空数组
        return of([]);
      })
    );
  }

  /**
   * 批量检查路由权限
   */
  checkBatchRoutePermissions(routes: string[], userId?: number): Observable<{
    routePath: string;
    hasPermission: boolean;
  }[]> {
    return this.userApiService.checkBatchRoutePermissions(routes, userId).pipe(
      map(response => response.results),
      catchError(error => {
        console.error('批量检查路由权限失败:', error);
        // 失败时返回所有路由无权限
        return of(routes.map(routePath => ({ routePath, hasPermission: false })));
      })
    );
  }

  /**
   * 预加载用户权限（应用启动时调用）
   */
  preloadPermissions(): Observable<void> {
    return this.syncPermissionsWithApi();
  }
}
