import { Component, input } from '@angular/core';
import { SiderHeader } from '../sider-header/sider-header';
import { SiderMenu } from '../sider-menu/sider-menu';
import { SiderFooter } from '../sider-footer/sider-footer';

@Component({
  selector: 'app-sider',
  imports: [SiderHeader, SiderFooter, SiderMenu],
  templateUrl: './sider.html',
  styleUrl: './sider.css',
})
export class Sider {
  isCollapsed = input(false);
}
