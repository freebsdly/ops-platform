import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzLayoutModule } from 'ng-zorro-antd/layout';
import { SiderHeader } from './layout/sider-header/sider-header';
import { SiderMenu } from './layout/sider-menu/sider-menu';
import { SiderFooter } from "./layout/sider-footer/sider-footer";

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, NzIconModule, NzLayoutModule, SiderHeader, SiderMenu, SiderFooter],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  logoSrc = 'https://ng.ant.design/assets/img/logo.svg';
  logoAlt = 'Logo';
  title = 'Ant Design of Angular';
  logoLink = 'https://ng.ant.design/';
  isCollapsed = false;
}
