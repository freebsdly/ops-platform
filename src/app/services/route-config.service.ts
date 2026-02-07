import { Injectable } from '@angular/core';
import { MENUS_CONFIG, MenuItem } from '../config/menu.config';

export interface RouteConfig {
  path: string;
  key: string;
  titleKey: string;
  icon?: string;
  component?: any;
  canActivate?: any[];
  children?: RouteConfig[];
  data?: Record<string, any>;
}

@Injectable({
  providedIn: 'root',
})
export class RouteConfigService {
  private readonly routeConfigs: RouteConfig[] = [];

  constructor() {
    this.initializeRouteConfigs();
  }

  private initializeRouteConfigs(): void {
    this.routeConfigs.push(
      // Welcome route (kept for potential direct access, but likely won't generate a tab)
      {
        path: '/welcome',
        key: 'welcome',
        titleKey: 'MENU.WELCOME',
        icon: 'dashboard',
      }
    );

    // Generate routes from menu configuration
    Object.values(MENUS_CONFIG).forEach(moduleMenus => {
      moduleMenus.forEach(menu => {
        // Add menu group if it has children
        if (menu.children && menu.children.length > 0) {
          menu.children.forEach(child => {
            if (child.link) {
              this.routeConfigs.push({
                path: child.link,
                key: child.key,
                titleKey: child.key,
                icon: child.icon,
              });
            }
          });
        } else if (menu.link) {
          // Add standalone menu item
          this.routeConfigs.push({
            path: menu.link,
            key: menu.key,
            titleKey: menu.key,
            icon: menu.icon,
          });
        }
      });
    });

    // Special routes (login, etc.)
    this.routeConfigs.push(
      {
        path: '/login',
        key: 'login',
        titleKey: 'MENU.LOGIN',
        icon: 'login',
      }
    );
  }

  /**
   * Get route configuration by path
   */
  getRouteConfig(path: string): RouteConfig | undefined {
    // Normalize path to ensure consistency
    const normalizedPath = path.startsWith('/') ? path : `/${path}`;
    
    // Check exact match first
    const exactMatch = this.routeConfigs.find(config => config.path === normalizedPath);
    if (exactMatch) {
      return exactMatch;
    }

    // Check for dynamic routes (e.g., /configuration/management/model/123)
    const pathSegments = normalizedPath.split('/').filter(segment => segment.length > 0);
    if (pathSegments.length >= 3) {
      // Try to match base path (first two segments)
      const basePath = `/${pathSegments.slice(0, 2).join('/')}`;
      const baseMatch = this.routeConfigs.find(config => config.path === basePath);
      if (baseMatch) {
        return {
          ...baseMatch,
          path: normalizedPath,
        };
      }
    }

    // Try to match with module base path
    const moduleBasePath = `/${pathSegments[0] || ''}`;
    const moduleMatch = this.routeConfigs.find(config => config.path === moduleBasePath);
    if (moduleMatch) {
      return {
        ...moduleMatch,
        path: normalizedPath,
      };
    }

    return undefined;
  }

  /**
   * Get tab configuration for a route path
   */
  getTabConfig(path: string): { key: string; label: string; icon?: string } {
    const config = this.getRouteConfig(path);
    
    if (config) {
      return {
        key: config.key,
        label: config.titleKey,
        icon: config.icon,
      };
    }

    // Default fallback for unknown routes
    const routeName = path.split('/').pop() || 'page';
    const sanitizedRouteName = routeName.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase();
    return {
      key: `page-${sanitizedRouteName}`,
      label: `MENU.${sanitizedRouteName.toUpperCase()}`,
      icon: 'appstore',
    };
  }

  /**
   * Get all route configurations
   */
  getAllRouteConfigs(): RouteConfig[] {
    return this.routeConfigs;
  }

  /**
   * Get menu structure from route configurations
   */
  getMenuStructure(): Array<{
    key: string;
    label: string;
    level: number;
    icon?: string;
    path?: string;
    open?: boolean;
    selected?: boolean;
    disabled?: boolean;
    children?: any[];
  }> {
    return this.routeConfigs
      .filter(config => config.path !== '/' && config.path !== '/login')
      .map(config => ({
        key: config.key,
        label: config.titleKey,
        level: config.path.split('/').length - 2, // Calculate level based on path depth
        icon: config.icon,
        path: config.path,
        open: false,
        selected: false,
        disabled: false,
      }));
  }

  /**
   * Get routes grouped by module
   */
  getRoutesByModule(): Record<string, RouteConfig[]> {
    const groupedRoutes: Record<string, RouteConfig[]> = {};
    
    this.routeConfigs.forEach(config => {
      const module = config.path.split('/')[1] || 'common';
      if (!groupedRoutes[module]) {
        groupedRoutes[module] = [];
      }
      groupedRoutes[module].push(config);
    });
    
    return groupedRoutes;
  }

  /**
   * Get available routes for a specific module
   */
  getRoutesForModule(moduleId: string): RouteConfig[] {
    return this.routeConfigs.filter(config => {
      const routeModule = config.path.split('/')[1];
      return routeModule === moduleId;
    });
  }

  /**
   * Get route by key
   */
  getRouteByKey(key: string): RouteConfig | undefined {
    return this.routeConfigs.find(config => config.key === key);
  }
}