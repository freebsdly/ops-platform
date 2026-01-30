import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NzMenuModule } from 'ng-zorro-antd/menu';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { TranslateModule } from '@ngx-translate/core';
import { StoreService } from '../../core/stores/store.service';
import { ModuleMenuService } from '../../services/module-menu.service';
import { AsyncPipe } from '@angular/common';
import { Observable, combineLatest, of } from 'rxjs';
import { switchMap, map } from 'rxjs/operators';
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
      let menuData$: Observable<MenuItem[]>;
      let isRootRoute = false;
      
      // 检查是否是根路由或空路径
      const isRootPath = !currentModuleId || 
                         currentModuleId === '' || 
                         currentModuleId === 'dashboard' ||
                         currentModuleId === 'welcome';
      
      if (isRootPath) {
        isRootRoute = true;
        // 根路由或仪表板：显示所有模块的概览菜单
        menuData$ = this.createRootMenuData();
      } else {
        // 其他模块从服务获取菜单
        menuData$ = this.moduleMenuService.getModuleMenus(currentModuleId);
      }
      
      return menuData$.pipe(
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

  trackByMenuId(_index: number, item: MenuItem): string {
    return item.key;
  }
}