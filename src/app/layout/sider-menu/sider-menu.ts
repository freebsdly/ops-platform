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
  }> = combineLatest([
    this.storeService.isSiderCollapsed$,
    this.storeService.currentModule$
  ]).pipe(
    switchMap(([isCollapsed, currentModuleId]) => {
      let menuData$: Observable<MenuItem[]>;
      
      if (!currentModuleId || currentModuleId === 'dashboard') {
        // 仪表板使用硬编码菜单
        menuData$ = of([
          {
            key: 'MENU.DASHBOARD_MAIN',
            text: '仪表板',
            icon: 'dashboard',
            link: '/dashboard'
          },
          {
            key: 'MENU.WELCOME',
            text: '欢迎页',
            icon: 'home',
            link: '/welcome'
          }
        ]);
      } else {
        // 其他模块从服务获取菜单
        menuData$ = this.moduleMenuService.getModuleMenus(currentModuleId);
      }
      
      return menuData$.pipe(
        map(menuData => ({
          isCollapsed,
          menuData
        }))
      );
    })
  );

  trackByMenuId(_index: number, item: MenuItem): string {
    return item.key;
  }
}