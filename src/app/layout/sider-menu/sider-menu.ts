import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NzMenuModule } from 'ng-zorro-antd/menu';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { TranslateModule } from '@ngx-translate/core';
import { StoreService } from '../../core/stores/store.service';
import { AsyncPipe } from '@angular/common';
import { Observable } from 'rxjs';

interface MenuItem {
  key: string;
  text: string;
  icon?: string;
  link?: string;
  children?: MenuItem[];
  open?: boolean;
}

@Component({
  selector: 'app-sider-menu',
  imports: [RouterLink, NzMenuModule, NzIconModule, TranslateModule, AsyncPipe],
  templateUrl: './sider-menu.html',
  styleUrl: './sider-menu.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SiderMenu {
  private storeService = inject(StoreService);
  
  isCollapsed$ = this.storeService.isSiderCollapsed$;
  
  // Simplified menu data - in a real app, this would come from service
  menuData: MenuItem[] = [
    {
      key: 'MENU.DASHBOARD',
      text: 'Dashboard',
      icon: 'dashboard',
      link: '/dashboard'
    },
    {
      key: 'MENU.CONFIGURATION',
      text: 'Configuration',
      icon: 'setting',
      children: [
        {
          key: 'MENU.MODEL_MANAGEMENT',
          text: 'Model Management',
          icon: 'appstore',
          link: '/configuration/management/model'
        },
        {
          key: 'MENU.OBJECT_MANAGEMENT',
          text: 'Object Management',
          icon: 'database',
          link: '/configuration/management/object'
        }
      ]
    },
    {
      key: 'MENU.MONITORING',
      text: 'Monitoring',
      icon: 'desktop',
      link: '/monitoring'
    }
  ];

  trackByMenuId(_index: number, item: any): string {
    return item.key;
  }
}
