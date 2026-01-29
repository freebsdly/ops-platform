import { Component, inject } from '@angular/core';
import { RouterOutlet, Router } from '@angular/router';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzLayoutModule } from 'ng-zorro-antd/layout';
import { Sider } from './layout/sider/sider';
import { LayoutService } from './layout.service';
import { CollapseButton } from './layout/collapse-button/collapse-button';
import { UserInfo, UserInfoData } from './layout/user-info/user-info';
import { LangSelector } from './layout/lang-selector/lang-selector';
import { ModuleSelector } from './layout/module-selector/module-selector';
import { AuthService } from './services/auth.service';

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
  private authService = inject(AuthService);
  
  isCollapsed = this.layoutService.isCollapsed.asReadonly();
  authState = this.authService.authState.asReadonly();

  isLoginPage(): boolean {
    return this.router.url === '/login' || this.router.url.startsWith('/login?');
  }

  getUserInfoData(): UserInfoData | null {
    const user = this.authState().user;
    if (!user) {
      return null;
    }
    
    // 从email推断角色（示例逻辑）
    const getRoleFromEmail = (email: string): string => {
      if (email.includes('admin')) return 'Administrator';
      if (email.includes('manager')) return 'Manager';
      return 'User';
    };
    
    return {
      name: user.name,
      email: user.email,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`,
      role: getRoleFromEmail(user.email)
    };
  }

  handleLogout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
