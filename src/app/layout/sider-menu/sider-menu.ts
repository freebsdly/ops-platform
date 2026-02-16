import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { NzMenuModule } from 'ng-zorro-antd/menu';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { TranslateModule } from '@ngx-translate/core';
import { StoreService } from '../../core/stores/store.service';
import { ModuleMenuService } from '../../services/module-menu.service';
import { AsyncPipe } from '@angular/common';
import { Observable, combineLatest, of } from 'rxjs';
import { switchMap, map, tap, distinctUntilChanged } from 'rxjs/operators';
import { MenuItem } from '../../config/menu.config';
import { MODULES_CONFIG, MENUS_CONFIG } from '../../config/menu.config';

@Component({
  selector: 'app-sider-menu',
  imports: [RouterLink, NzMenuModule, NzIconModule, TranslateModule, AsyncPipe],
  templateUrl: './sider-menu.html',
  styleUrl: './sider-menu.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SiderMenu {
  private storeService = inject(StoreService);
  private moduleMenuService = inject(ModuleMenuService);
  private router = inject(Router);
  private activatedRoute = inject(ActivatedRoute);

  // 组合Observable：当前模块ID和侧边栏折叠状态
  vm$: Observable<{
    isCollapsed: boolean;
    menuData: MenuItem[];
    isRootRoute: boolean;
  }> = combineLatest([
    this.storeService.isSiderCollapsed$,
    this.storeService.currentModule$
  ]).pipe(
    switchMap(([isCollapsed, currentModuleId]) => {
      console.log(`[SiderMenu] Module changed: ${currentModuleId}, collapsed: ${isCollapsed}`);
      let menuData$: Observable<MenuItem[]>;
      let isRootRoute = false;

      // 检查是否是根路由或空路径
      const isRootPath = !currentModuleId ||
                         currentModuleId === '' ||
                         currentModuleId === 'dashboard' ||
                         currentModuleId === 'welcome';

      if (isRootPath) {
        isRootRoute = true;
        console.log(`[SiderMenu] Showing root menu for module: ${currentModuleId}`);
        // 根路由或仪表板：显示所有模块的概览菜单
        menuData$ = this.createRootMenuData();
      } else {
        console.log(`[SiderMenu] Getting module menus for: ${currentModuleId}`);
        // 其他模块从服务获取菜单
        menuData$ = this.moduleMenuService.getModuleMenus(currentModuleId);
      }

      return menuData$.pipe(
        map(menuData => this.expandActiveMenu(menuData)),
        map(menuData => ({
          isCollapsed,
          menuData,
          isRootRoute
        }))
      );
    })
  );

  // 创建根路由的菜单数据
  private createRootMenuData(): Observable<MenuItem[]> {
    const allMenuData: MenuItem[] = [];
    
    // 添加仪表板作为第一个菜单项
    allMenuData.push({
      key: 'MENU.DASHBOARD_MAIN',
      text: '仪表板',
      icon: 'dashboard',
      link: '/dashboard',
      open: false
    });
    
    // 添加欢迎页
    allMenuData.push({
      key: 'MENU.WELCOME',
      text: '欢迎页',
      icon: 'home',
      link: '/welcome',
      open: false
    });
    
    // 遍历所有模块，创建分组
    MODULES_CONFIG.forEach(moduleConfig => {
      const moduleMenus = MENUS_CONFIG[moduleConfig.id];
      if (moduleMenus && moduleMenus.length > 0) {
        // 收集模块内的所有链接
        const moduleLinks: MenuItem[] = [];
        
        moduleMenus.forEach(moduleMenu => {
          if (moduleMenu.children && moduleMenu.children.length > 0) {
            moduleMenu.children.forEach(child => {
              if (child.link) {
                moduleLinks.push({
                  key: child.key,
                  text: child.text,
                  icon: child.icon,
                  link: child.link,
                  open: false
                });
              }
            });
          } else if (moduleMenu.link) {
            moduleLinks.push({
              key: moduleMenu.key,
              text: moduleMenu.text,
              icon: moduleMenu.icon,
              link: moduleMenu.link,
              open: false
            });
          }
        });
        
        // 如果模块有链接，创建模块分组
        if (moduleLinks.length > 0) {
          const moduleGroup: MenuItem = {
            key: moduleConfig.title,
            text: moduleConfig.title,
            icon: moduleConfig.icon,
            open: false,
            children: moduleLinks
          };
          allMenuData.push(moduleGroup);
        }
      }
    });
    
    return of(allMenuData);
  }

  /**
   * 递归展开包含当前激活路由的菜单组
   * @param menuData 菜单数据
   * @returns 处理后的菜单数据
   */
  private expandActiveMenu(menuData: MenuItem[]): MenuItem[] {
    const currentUrl = this.router.url;
    console.log(`[SiderMenu] Expanding active menu for URL: ${currentUrl}`);

    // 递归处理菜单数据
    const processMenu = (items: MenuItem[]): MenuItem[] => {
      return items.map(item => {
        // 如果有子菜单，递归处理
        if (item.children && item.children.length > 0) {
          const processedChildren = processMenu(item.children);

          // 检查子菜单中是否有匹配当前路由的项
          const hasActiveChild = this.hasActiveChild(processedChildren, currentUrl);

          // 如果子菜单中有激活项，展开当前菜单组
          return {
            ...item,
            children: processedChildren,
            open: hasActiveChild || item.open || false
          };
        }

        // 检查当前菜单项是否匹配当前路由
        const isCurrentRoute = this.isRouteMatch(item.link, currentUrl);

        return {
          ...item,
          // 如果是当前路由，保持展开状态
          open: isCurrentRoute || item.open || false
        };
      });
    };

    return processMenu(menuData);
  }

  /**
   * 检查子菜单中是否有匹配当前路由的项
   * @param children 子菜单项
   * @param currentUrl 当前URL
   * @returns 是否有激活的子项
   */
  private hasActiveChild(children: MenuItem[], currentUrl: string): boolean {
    return children.some(child => {
      if (child.children && child.children.length > 0) {
        return this.hasActiveChild(child.children, currentUrl);
      }
      return this.isRouteMatch(child.link, currentUrl);
    });
  }

  /**
   * 检查路由是否匹配
   * @param menuLink 菜单链接
   * @param currentUrl 当前URL
   * @returns 是否匹配
   */
  private isRouteMatch(menuLink: string | undefined, currentUrl: string): boolean {
    if (!menuLink) return false;

    // 精确匹配
    if (menuLink === currentUrl) return true;

    // 前缀匹配（处理嵌套路由）
    if (currentUrl.startsWith(menuLink)) {
      // 确保是完整的路径段匹配，而不是部分匹配
      // 例如：/monitoring 应该匹配 /monitoring/servers
      // 但 /mon 不应该匹配 /monitoring
      const nextChar = currentUrl.charAt(menuLink.length);
      return !nextChar || nextChar === '/' || nextChar === '?';
    }

    return false;
  }

  trackByMenuId(_index: number, item: MenuItem): string {
    return item.key;
  }
}