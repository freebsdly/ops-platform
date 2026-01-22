import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NzMenuModule } from 'ng-zorro-antd/menu';
import { LayoutService } from '../../layout.service';

@Component({
  selector: 'app-sider-menu',
  imports: [RouterLink, NzMenuModule],
  templateUrl: './sider-menu.html',
  styleUrl: './sider-menu.css',
})
export class SiderMenu {
  layoutService = inject(LayoutService);
  isCollapsed = this.layoutService.isCollapsed.asReadonly();
}
