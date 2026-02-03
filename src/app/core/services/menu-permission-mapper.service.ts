import { Injectable, inject } from '@angular/core';
import { MenuItem } from '../../config/menu.config';
import { MenuPermission } from '../types/menu-permission.interface';
import { User } from '../types/user.interface';

@Injectable({
  providedIn: 'root'
})
export class MenuPermissionMapperService {
  
  /**
   * 将菜单配置映射为权限配置
   */
  mapMenuToPermission(menuItem: MenuItem): MenuPermission | null {
    if (!menuItem.permission && (!menuItem.roles || menuItem.roles.length === 0)) {
      return null;
    }

    return {
      menuId: menuItem.key || menuItem.link || '',
      resource: menuItem.permission?.resource || this.extractResourceFromLink(menuItem.link),
      action: Array.isArray(menuItem.permission?.action) 
        ? menuItem.permission.action 
        : (menuItem.permission?.action ? [menuItem.permission.action] : ['read']), // 默认可读
      requiredRoles: menuItem.roles
    };
  }

  /**
   * 从链接中提取资源标识
   */
  private extractResourceFromLink(link?: string): string {
    if (!link) return 'unknown';
    
    // 从路径中提取资源，如：/configuration/management/model -> configuration
    const parts = link.split('/').filter(part => part.length > 0);
    return parts[0] || 'unknown';
  }

  /**
   * 将路由路径映射到权限检查
   */
  getPermissionByRoute(routePath: string, menuItems: MenuItem[]): MenuPermission | null {
    // 标准化路径
    const normalizedPath = this.normalizeRoutePath(routePath);
    
    // 查找匹配的菜单项
    const matchingMenu = this.findMenuByPath(normalizedPath, menuItems);
    if (matchingMenu) {
      return this.mapMenuToPermission(matchingMenu);
    }
    
    return null;
  }

  /**
   * 验证用户是否有菜单访问权限
   */
  hasMenuAccess(user: User, menuItem: MenuItem): boolean {
    // 如果没有权限要求，允许访问
    if (!menuItem.permission && (!menuItem.roles || menuItem.roles.length === 0)) {
      return true;
    }

    // 检查角色权限
    if (menuItem.roles && menuItem.roles.length > 0) {
      const hasRole = menuItem.roles.some(role => user.roles.includes(role));
      if (!hasRole) {
        return false;
      }
    }

    // 检查细粒度权限
    if (menuItem.permission) {
      const hasPermission = user.permissions?.some(permission => 
        permission.resource === menuItem.permission!.resource &&
        permission.action.includes(menuItem.permission!.action)
      );
      if (!hasPermission) {
        return false;
      }
    }

    // 检查菜单权限
    if (user.menuPermissions) {
      const menuPermission = this.mapMenuToPermission(menuItem);
      if (menuPermission) {
        const hasMenuPermission = user.menuPermissions.some(mp => 
          mp.menuId === menuPermission.menuId
        );
        if (!hasMenuPermission) {
          return false;
        }
      }
    }

    return true;
  }

  /**
   * 根据用户权限过滤菜单列表
   */
  filterMenusByUserAccess(menus: MenuItem[], user: User): MenuItem[] {
    return menus
      .map(menu => this.filterMenuItem(menu, user))
      .filter(menu => menu !== null) as MenuItem[];
  }

  /**
   * 过滤单个菜单项
   */
  private filterMenuItem(menu: MenuItem, user: User): MenuItem | null {
    // 检查当前菜单项的权限
    if (!this.hasMenuAccess(user, menu)) {
      return null;
    }

    // 如果有子菜单，递归过滤
    if (menu.children && menu.children.length > 0) {
      const filteredChildren = this.filterMenusByUserAccess(menu.children, user);
      if (filteredChildren.length === 0) {
        // 如果所有子菜单都无权限，且当前菜单没有链接，则隐藏
        return menu.link ? menu : null;
      }
      
      return {
        ...menu,
        children: filteredChildren
      };
    }

    return menu;
  }

  /**
   * 标准化路由路径
   */
  private normalizeRoutePath(path: string): string {
    // 移除查询参数和哈希
    const cleanPath = path.split('?')[0].split('#')[0];
    // 确保以斜杠开头
    return cleanPath.startsWith('/') ? cleanPath : `/${cleanPath}`;
  }

  /**
   * 根据路径查找菜单项
   */
  private findMenuByPath(path: string, menuItems: MenuItem[]): MenuItem | null {
    for (const menu of menuItems) {
      // 检查当前菜单
      if (menu.link && this.normalizeRoutePath(menu.link) === path) {
        return menu;
      }

      // 检查子菜单
      if (menu.children && menu.children.length > 0) {
        const foundInChildren = this.findMenuByPath(path, menu.children);
        if (foundInChildren) {
          return foundInChildren;
        }
      }
    }
    
    return null;
  }

  /**
   * 获取用户有权限的所有路由路径
   */
  getUserAccessibleRoutes(menus: MenuItem[], user: User): string[] {
    const routes: string[] = [];
    
    const collectRoutes = (menuList: MenuItem[]) => {
      for (const menu of menuList) {
        if (this.hasMenuAccess(user, menu) && menu.link) {
          routes.push(menu.link);
        }
        
        if (menu.children && menu.children.length > 0) {
          collectRoutes(menu.children);
        }
      }
    };
    
    collectRoutes(menus);
    return routes;
  }

  /**
   * 检查用户是否有特定路由的访问权限
   */
  hasRouteAccess(routePath: string, menus: MenuItem[], user: User): boolean {
    const menu = this.findMenuByPath(routePath, menus);
    if (!menu) {
      // 如果没有对应的菜单配置，需要额外的权限检查逻辑
      return this.checkRouteWithoutMenu(routePath, user);
    }
    
    return this.hasMenuAccess(user, menu);
  }

  /**
   * 检查没有对应菜单的路由权限
   */
  private checkRouteWithoutMenu(routePath: string, user: User): boolean {
    // 这里可以根据业务需求实现额外的逻辑
    // 例如：检查路径模式、默认权限等
    
    // 暂时返回true，允许访问没有菜单配置的路由
    // 实际项目中应该根据具体需求调整
    return true;
  }
}