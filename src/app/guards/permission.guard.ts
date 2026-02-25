import { inject } from '@angular/core';
import { CanActivateFn, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Observable, of } from 'rxjs';
import { map, catchError, switchMap, take, filter } from 'rxjs/operators';
import { Store } from '@ngrx/store';
import { AppState } from '../core/types/app-state';
import * as AuthSelectors from '../core/stores/auth/auth.selectors';
import { PermissionService } from '../services/permission.service';
import { UserApiService } from '../core/services/user-api.service';
import { MenuPermissionMapperService } from '../core/services/menu-permission-mapper.service';
import { MENUS_CONFIG } from '../config/menu.config';

/**
 * 权限守卫工厂函数
 * @param PermissionConfig - 权限配置（可选）
 * @param requiredRoles - 必需的角色列表（可选）
 */
export const permissionGuard = (
  permissionConfig?: { resource: string; action: string },
  requiredRoles?: string[]
): CanActivateFn => {
  return (route: ActivatedRouteSnapshot, state: RouterStateSnapshot) => {
    const store = inject(Store<AppState>);
    const router = inject(Router);
    const permissionService = inject(PermissionService);
    const userApiService = inject(UserApiService);
    const menuPermissionMapper = inject(MenuPermissionMapperService);

    // 1. 从路由数据获取权限要求（如果未通过参数提供）
    const requiredPermission = permissionConfig || route.data['permission'] as {
      resource: string;
      action: string;
    };

    // 2. 从路由数据获取角色要求（如果未通过参数提供）
    const routeRequiredRoles = requiredRoles || route.data['roles'] as string[];

    // 3. 获取当前路由路径
    const routePath = state.url.split('?')[0]; // 移除查询参数

    // 首先等待认证状态加载完成
    return waitForAuthCheck(store).pipe(
      switchMap(() => {
        // 如果有明确的权限要求，检查特定权限
        if (requiredPermission) {
          return checkSpecificPermission(
            requiredPermission,
            routePath,
            state,
            store,
            router,
            permissionService,
            userApiService
          );
        }

        // 如果有角色要求，检查角色
        if (routeRequiredRoles && routeRequiredRoles.length > 0) {
          return checkRoles(
            routeRequiredRoles,
            state,
            store,
            router
          );
        }

        // 如果没有明确要求，检查菜单权限
        return checkMenuPermission(
          routePath,
          state,
          store,
          router,
          userApiService,
          menuPermissionMapper
        );
      })
    );
  };
};

/**
 * 角色守卫工厂函数
 * @param requiredRoles - 必需的角色列表
 */
export const roleGuard = (requiredRoles: string[]): CanActivateFn => {
  return (route: ActivatedRouteSnapshot, state: RouterStateSnapshot) => {
    const store = inject(Store<AppState>);
    const router = inject(Router);

    return checkRoles(requiredRoles, state, store, router);
  };
};

/**
 * 等待认证检查完成
 * 确保在检查权限前，用户状态已经加载完毕
 */
function waitForAuthCheck(store: Store<AppState>): Observable<boolean> {
  return store.select(AuthSelectors.selectIsLoading).pipe(
    filter(isLoading => !isLoading),
    take(1),
    map(() => true)
  );
}

/**
 * 检查特定权限
 */
function checkSpecificPermission(
  permission: { resource: string; action: string },
  routePath: string,
  state: RouterStateSnapshot,
  store: Store<AppState>,
  router: Router,
  permissionService: PermissionService,
  userApiService: UserApiService
): Observable<boolean> {
  // 先检查本地权限
  const hasLocalPermission = permissionService.hasPermission(
    permission.resource,
    permission.action
  );

  if (hasLocalPermission) {
    return of(true);
  }

  // 本地检查失败，尝试API验证
  return store.select(AuthSelectors.selectUser).pipe(
    take(1),
    switchMap(user => {
      if (!user || !user.id) {
        redirectToNoPermission(router, state.url);
        return of(false);
      }

      return userApiService.checkRoutePermission(routePath, user.id).pipe(
        map(response => {
          if (!response.hasPermission) {
            redirectToNoPermission(router, state.url);
          }
          return response.hasPermission;
        }),
        catchError(error => {
          console.error('API权限检查失败:', error);
          redirectToNoPermission(router, state.url);
          return of(false);
        })
      );
    })
  );
}

/**
 * 检查角色权限
 */
function checkRoles(
  requiredRoles: string[],
  state: RouterStateSnapshot,
  store: Store<AppState>,
  router: Router
): Observable<boolean> {
  return store.select(AuthSelectors.selectUserRoles).pipe(
    take(1),
    map(userRoles => {
      const hasRequiredRole = requiredRoles.some(role =>
        userRoles.includes(role)
      );

      if (!hasRequiredRole) {
        redirectToNoPermission(router, state.url);
      }

      return hasRequiredRole;
    }),
    catchError(error => {
      console.error('角色检查失败:', error);
      redirectToNoPermission(router, state.url);
      return of(false);
    })
  );
}

/**
 * 检查菜单权限

 * @description
 * 根据当前路由路径，检查用户是否有访问该路由的权限。权限检查分为两步：
 * 1. 先检查本地权限（基于当前用户权限列表）
 * 2. 如果本地检查失败，则通过 API 验证权限
 * @param routePath - 当前路由路径
 * @param state - 路由状态
 * @param store - NgRx 状态存储
 * @param router - 路由器
 * @param userApiService - 用户 API 服务
 * @param menuPermissionMapper - 菜单权限映射服务
 * @returns Observable<boolean> - 权限检查结果
 */
function checkMenuPermission(
  routePath: string,
  state: RouterStateSnapshot,
  store: Store<AppState>,
  router: Router,
  userApiService: UserApiService,
  menuPermissionMapper: MenuPermissionMapperService
): Observable<boolean> {
  // 检查是否有对应的菜单权限配置
  const allMenuItems = getAllMenuItems();
  const menuPermission = menuPermissionMapper.getPermissionByRoute(routePath, allMenuItems);

  if (!menuPermission) {
    // 没有菜单权限配置，允许访问（或根据业务需求调整）
    return of(true);
  }

  // 获取用户信息并检查权限
  return store.select(AuthSelectors.selectUser).pipe(
    take(1),
    switchMap(user => {
      if (!user || !user.id) {
        redirectToNoPermission(router, state.url);
        return of(false);
      }

      // 检查用户是否有菜单访问权限
      const menuItem = findMenuItemByPath(routePath, allMenuItems);
      if (menuItem && menuPermissionMapper.hasMenuAccess(user, menuItem)) {
        return of(true);
      }

      // 本地检查失败，尝试API验证
      return userApiService.checkRoutePermission(routePath, user.id).pipe(
        map(response => {
          if (!response.hasPermission) {
            redirectToNoPermission(router, state.url);
          }
          return response.hasPermission;
        }),
        catchError(error => {
          console.error('API菜单权限检查失败:', error);
          redirectToNoPermission(router, state.url);
          return of(false);
        })
      );
    })
  );
}

/**
 * 重定向到无权限页面
 */
function redirectToNoPermission(router: Router, returnUrl: string): void {
  router.navigate(['/no-permission'], {
    queryParams: { returnUrl }
  });
}

/**
 * 获取所有菜单项的扁平化列表
 */
function getAllMenuItems(): any[] {
  const items: any[] = [];

  const collectItems = (menuList: any[]) => {
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
 * 根据路径查找菜单项
 */
function findMenuItemByPath(path: string, menuItems: any[]): any | null {
  for (const menu of menuItems) {
    if (menu.link === path) {
      return menu;
    }

    if (menu.children && menu.children.length > 0) {
      const foundInChildren = findMenuItemByPath(path, menu.children);
      if (foundInChildren) {
        return foundInChildren;
      }
    }
  }

  return null;
}
