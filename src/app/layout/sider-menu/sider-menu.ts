import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NzMenuModule } from 'ng-zorro-antd/menu';

@Component({
  selector: 'app-sider-menu',
  imports: [RouterLink, NzMenuModule],
  templateUrl: './sider-menu.html',
  styleUrl: './sider-menu.css',
  host: {
    'class': 'sider-menu'
  }
})
export class SiderMenu {
  isCollapsed = input(false);
}
