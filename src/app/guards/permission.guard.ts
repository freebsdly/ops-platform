import { Injectable, inject } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot } from '@angular/router';
import { Observable, of, combineLatest } from 'rxjs';
import { map, catchError, switchMap, take } from 'rxjs/operators';
import { Store } from '@ngrx/store';
import { AppState } from '../core/types/app-state';
import * as AuthSelectors from '../core/stores/auth/auth.selectors';
import { PermissionService } from '../services/permission.service';
import { UserApiService } from '../core/services/user-api.service';
import { MenuPermissionMapperService } from '../core/services/menu-permission-mapper.service';
import { MENUS_CONFIG } from '../config/menu.config';

@Injectable({
  providedIn: 'root',
})
export class PermissionGuard implements CanActivate {
  private store = inject(Store<AppState>);
  private router = inject(Router);
  private permissionService = inject(PermissionService);
  private userApiService = inject(UserApiService);
  private menuPermissionMapper = inject(MenuPermissionMapperService);

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> | boolean {
    // 1. 从路由数据获取权限要求
    const requiredPermission = route.data['permission'] as {
      resource: string;
      action: string;
    };
    
    // 2. 从路由数据获取角色要求
    const requiredRoles = route.data['roles'] as string[];
    
    // 3. 获取当前路由路径
    const routePath = state.url.split('?')[0]; // 移除查询参数

    // 如果有明确的权限要求，检查特定权限
    if (requiredPermission) {
      return this.checkSpecificPermission(requiredPermission, routePath, state);
    }

    // 如果有角色要求，检查角色
    if (requiredRoles && requiredRoles.length > 0) {
      return this.checkRoles(requiredRoles, routePath, state);
    }

    // 如果没有明确要求，检查菜单权限
    return this.checkMenuPermission(routePath, state);
  }

  /**
   * 检查特定权限
   */
  private checkSpecificPermission(
    permission: { resource: string; action: string },
    routePath: string,
    state: RouterStateSnapshot
  ): Observable<boolean> {
    // 先检查本地权限
    const hasLocalPermission = this.permissionService.hasPermission(
      permission.resource,
      permission.action
    );

    if (hasLocalPermission) {
      return of(true);
    }

    // 本地检查失败，尝试API验证
    return this.store.select(AuthSelectors.selectUser).pipe(
      take(1),
      switchMap(user => {
        if (!user || !user.id) {
          this.redirectToNoPermission(state.url);
          return of(false);
        }

        return this.userApiService.checkRoutePermission(routePath, user.id).pipe(
          map(response => {
            if (!response.hasPermission) {
              this.redirectToNoPermission(state.url);
            }
            return response.hasPermission;
          }),
          catchError(error => {
            console.error('API权限检查失败:', error);
            this.redirectToNoPermission(state.url);
            return of(false);
          })
        );
      })
    );
  }

  /**
   * 检查角色权限
   */
  private checkRoles(
    requiredRoles: string[],
    routePath: string,
    state: RouterStateSnapshot
  ): Observable<boolean> {
    return this.store.select(AuthSelectors.selectUserRoles).pipe(
      take(1),
      map(userRoles => {
        const hasRequiredRole = requiredRoles.some(role => 
          userRoles.includes(role)
        );
        
        if (!hasRequiredRole) {
          this.redirectToNoPermission(state.url);
        }
        
        return hasRequiredRole;
      }),
      catchError(error => {
        console.error('角色检查失败:', error);
        this.redirectToNoPermission(state.url);
        return of(false);
      })
    );
  }

  /**
   * 检查菜单权限
   */
  private checkMenuPermission(routePath: string, state: RouterStateSnapshot): Observable<boolean> {
    // 检查是否有对应的菜单权限配置
    const allMenuItems = this.getAllMenuItems();
    const menuPermission = this.menuPermissionMapper.getPermissionByRoute(routePath, allMenuItems);

    if (!menuPermission) {
      // 没有菜单权限配置，允许访问（或根据业务需求调整）
      return of(true);
    }

    // 获取用户信息并检查权限
    return this.store.select(AuthSelectors.selectUser).pipe(
      take(1),
      switchMap(user => {
        if (!user || !user.id) {
          this.redirectToNoPermission(state.url);
          return of(false);
        }

        // 检查用户是否有菜单访问权限
        const menuItem = this.findMenuItemByPath(routePath, allMenuItems);
        if (menuItem && this.menuPermissionMapper.hasMenuAccess(user, menuItem)) {
          return of(true);
        }

        // 本地检查失败，尝试API验证
        return this.userApiService.checkRoutePermission(routePath, user.id).pipe(
          map(response => {
            if (!response.hasPermission) {
              this.redirectToNoPermission(state.url);
            }
            return response.hasPermission;
          }),
          catchError(error => {
            console.error('API菜单权限检查失败:', error);
            this.redirectToNoPermission(state.url);
            return of(false);
          })
        );
      })
    );
  }

  /**
   * 重定向到无权限页面
   */
  private redirectToNoPermission(returnUrl: string): void {
    this.router.navigate(['/no-permission'], {
      queryParams: { returnUrl }
    });
  }

  /**
   * 获取所有菜单项的扁平化列表
   */
  private getAllMenuItems(): any[] {
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
  private findMenuItemByPath(path: string, menuItems: any[]): any | null {
    for (const menu of menuItems) {
      if (menu.link === path) {
        return menu;
      }
      
      if (menu.children && menu.children.length > 0) {
        const foundInChildren = this.findMenuItemByPath(path, menu.children);
        if (foundInChildren) {
          return foundInChildren;
        }
      }
    }
    
    return null;
  }
}