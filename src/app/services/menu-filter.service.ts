import { Injectable, inject } from '@angular/core';
import { MenuItem } from '../config/menu.config';
import { Permission } from '../core/types/permission.interface';
import { PermissionService } from './permission.service';
import { Store } from '@ngrx/store';
import { AppState } from '../core/types/app-state';
import * as AuthSelectors from '../core/stores/auth/auth.selectors';
import { toSignal } from '@angular/core/rxjs-interop';

@Injectable({
  providedIn: 'root',
})
export class MenuFilterService {
  private permissionService = inject(PermissionService);
  private store = inject(Store<AppState>);

  // 使用 toSignal 将 store 选择器转换为信号
  private userRolesSig = toSignal(this.store.select(AuthSelectors.selectUserRoles), { initialValue: [] });
  private permissionsSig = toSignal(this.store.select(AuthSelectors.selectPermissions), { initialValue: [] });

  /**
   * 根据用户权限过滤菜单
   * @param menus 原始菜单配置
   * @param permissions 用户权限列表
   * @returns 过滤后的菜单
   */
  filterByPermissions(menus: MenuItem[], permissions: Permission[]): MenuItem[] {
    return menus
      .map(menu => this.filterMenuItem(menu, permissions))
      .filter(menu => menu !== null) as MenuItem[];
  }

  /**
   * 过滤单个菜单项
   */
  private filterMenuItem(menu: MenuItem, permissions: Permission[]): MenuItem | null {
    // 检查菜单项本身是否有权限要求
    if (menu.permission) {
      const hasPermission = permissions.some(perm =>
        perm.resource === menu.permission!.resource &&
        perm.action.includes(menu.permission!.action)
      );

      if (!hasPermission) {
        return null;
      }
    }

    // 检查角色要求
    if (menu.roles && menu.roles.length > 0) {
      const userRoles = this.getCurrentUserRoles();
      const hasRequiredRole = menu.roles.some(role => userRoles.includes(role));

      if (!hasRequiredRole) {
        return null;
      }
    }

    // 递归过滤子菜单
    let filteredChildren: MenuItem[] = [];
    if (menu.children && menu.children.length > 0) {
      filteredChildren = menu.children
        .map(child => this.filterMenuItem(child, permissions))
        .filter(child => child !== null) as MenuItem[];
    }

    // 如果有子菜单且子菜单都被过滤掉，但父菜单本身有链接，则保留父菜单
    if (filteredChildren.length === 0 && menu.children && menu.children.length > 0) {
      // 如果父菜单有链接，保留父菜单
      if (menu.link) {
        return {
          ...menu,
          children: []
        };
      }
      // 否则过滤掉
      return null;
    }

    // 返回过滤后的菜单项
    return {
      ...menu,
      children: filteredChildren.length > 0 ? filteredChildren : undefined
    };
  }

  /**
   * 从Store获取当前用户角色
   */
  private getCurrentUserRoles(): string[] {
    return this.userRolesSig();
  }

  /**
   * 从Store获取当前用户权限
   */
  private getCurrentPermissions(): Permission[] {
    return this.permissionsSig();
  }

  /**
   * 检查用户是否有菜单访问权限
   */
  hasMenuAccess(menu: MenuItem): boolean {
    const permissions = this.getCurrentPermissions();

    if (menu.permission) {
      return permissions.some(perm =>
        perm.resource === menu.permission!.resource &&
        perm.action.includes(menu.permission!.action)
      );
    }

    if (menu.roles && menu.roles.length > 0) {
      const userRoles = this.getCurrentUserRoles();
      return menu.roles.some(role => userRoles.includes(role));
    }

    // 如果没有权限要求，默认允许访问
    return true;
  }

  /**
   * 根据权限过滤并返回扁平化的可访问菜单项
   */
  getAccessibleMenuItems(menus: MenuItem[]): MenuItem[] {
    const accessibleItems: MenuItem[] = [];

    const traverseMenu = (menuItems: MenuItem[]) => {
      for (const menu of menuItems) {
        if (this.hasMenuAccess(menu)) {
          accessibleItems.push(menu);
        }

        if (menu.children && menu.children.length > 0) {
          traverseMenu(menu.children);
        }
      }
    };

    traverseMenu(menus);
    return accessibleItems;
  }
}
