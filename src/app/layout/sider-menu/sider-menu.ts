import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NzMenuModule } from 'ng-zorro-antd/menu';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { LayoutService } from '../../layout.service';
import { MenuItem } from '../../layout.service';

@Component({
  selector: 'app-sider-menu',
  imports: [RouterLink, NzMenuModule, NzIconModule],
  templateUrl: './sider-menu.html',
  styleUrl: './sider-menu.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SiderMenu {
  layoutService = inject(LayoutService);
  isCollapsed = this.layoutService.isCollapsed.asReadonly();
  menuData = this.layoutService.menuData.asReadonly();

  trackByMenuId(_index: number, item: MenuItem): string {
    return item.text;
  }
}
