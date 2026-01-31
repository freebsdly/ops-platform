import { Injectable, inject } from '@angular/core';
import { StoreService } from './core/stores/store.service';
import { Observable } from 'rxjs';

export interface MenuItem {
  text: string;
  icon?: string;
  link?: string;
  children?: MenuItem[];
  open?: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class LayoutService {
  private storeService = inject(StoreService);
  
  get isCollapsed(): { asReadonly: () => Observable<boolean> } {
    return {
      asReadonly: () => this.storeService.isSiderCollapsed$
    };
  }

  toggle() {
    this.storeService.toggleSider();
  }

  setCollapsed(collapsed: boolean) {
    this.storeService.setSiderCollapsed(collapsed);
  }

  getAppVersion() {
    return {
      asReadonly: () => {
        const version = 'v1.0.0';
        return {
          get: () => version,
          subscribe: () => ({ unsubscribe: () => {} })
        };
      }
    };
  }

  // 新增配置相关方法
  getLayoutConfig() {
    return {
      asReadonly: () => this.storeService.layoutConfig$
    };
  }

  getLogoConfig() {
    return {
      asReadonly: () => this.storeService.logoConfig$
    };
  }

  getAppTitle() {
    return {
      asReadonly: () => this.storeService.appTitle$
    };
  }
}
