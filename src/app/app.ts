import { Component, inject } from '@angular/core';
import { RouterOutlet, Router } from '@angular/router';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzLayoutModule } from 'ng-zorro-antd/layout';
import { Sider } from './layout/sider/sider';
import { LayoutService } from './layout.service';
import { CollapseButton } from './layout/collapse-button/collapse-button';
import { UserInfo } from './layout/user-info/user-info';
import { LangSelector } from './layout/lang-selector/lang-selector';
import { ModuleSelector } from './layout/module-selector/module-selector';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, NzIconModule, NzLayoutModule, Sider, CollapseButton, UserInfo, LangSelector, ModuleSelector],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  logoSrc = 'https://ng.ant.design/assets/img/logo.svg';
  logoAlt = 'Logo';
  title = 'Ant Design of Angular';
  logoLink = 'https://ng.ant.design/';

  layoutService = inject(LayoutService);
  private router = inject(Router);
  isCollapsed = this.layoutService.isCollapsed.asReadonly();

  isLoginPage(): boolean {
    return this.router.url === '/login' || this.router.url.startsWith('/login?');
  }
}
