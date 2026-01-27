import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NzMenuModule } from 'ng-zorro-antd/menu';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { ModuleMenuService } from '../../services/module-menu.service';
import { LayoutService } from '../../layout.service';

@Component({
  selector: 'app-sider-menu',
  imports: [RouterLink, NzMenuModule, NzIconModule],
  templateUrl: './sider-menu.html',
  styleUrl: './sider-menu.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SiderMenu {
  private moduleMenuService = inject(ModuleMenuService);
  layoutService = inject(LayoutService);
  
  menuData = this.moduleMenuService.currentModuleMenus;
  isCollapsed = this.layoutService.isCollapsed.asReadonly();

  trackByMenuId(_index: number, item: any): string {
    return item.text;
  }
}
