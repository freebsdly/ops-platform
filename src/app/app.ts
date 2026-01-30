import { Component, inject, OnInit } from '@angular/core';
import { RouterOutlet, Router } from '@angular/router';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzLayoutModule } from 'ng-zorro-antd/layout';
import { Sider } from './layout/sider/sider';
import { LayoutService } from './layout.service';
import { CollapseButton } from './layout/collapse-button/collapse-button';
import { UserInfo } from './layout/user-info/user-info';
import { LangSelector } from './layout/lang-selector/lang-selector';
import { ModuleSelector } from './layout/module-selector/module-selector';
import { StoreService } from './core/stores/store.service';
import { AsyncPipe } from '@angular/common';
import { RouteLoadingIndicatorComponent } from './components/route-loading-indicator.component';

@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet, 
    NzIconModule, 
    NzLayoutModule, 
    Sider, 
    CollapseButton, 
    UserInfo, 
    LangSelector, 
    ModuleSelector, 
    AsyncPipe,
    RouteLoadingIndicatorComponent
  ],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App implements OnInit {
  logoSrc = 'https://ng.ant.design/assets.img/logo.svg';
  logoAlt = 'Logo';
  title = 'Ant Design of Angular';
  logoLink = 'https://ng.ant.design/';

  layoutService = inject(LayoutService);
  private router = inject(Router);
  storeService = inject(StoreService);
  
  // NgRx state observables
  isAuthenticated$ = this.storeService.isAuthenticated$;
  user$ = this.storeService.user$;
  isSiderCollapsed$ = this.storeService.isSiderCollapsed$;
  modules$ = this.storeService.modules$;

  ngOnInit(): void {
    // Check authentication status on app initialization
    this.storeService.checkAuth();
    // Load available modules
    this.storeService.loadModules();
    
    // Initialize layout state from localStorage
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme && (savedTheme === 'light' || savedTheme === 'dark')) {
      this.storeService.setTheme(savedTheme);
    }
    
    const savedSiderCollapsed = localStorage.getItem('siderCollapsed');
    if (savedSiderCollapsed) {
      this.storeService.setSiderCollapsed(savedSiderCollapsed === 'true');
    }
    
    // Set current module based on initial URL
    this.setInitialModule();
  }

  isLoginPage(): boolean {
    return this.router.url === '/login' || this.router.url.startsWith('/login?');
  }

  private setInitialModule(): void {
    const url = this.router.url;
    const segments = url.split('/').filter(segment => segment.length > 0);
    
    // Default to dashboard if no segments or first segment is dashboard
    let currentModule = segments[0] || 'dashboard';
    
    // Check if it's a valid module from MODULES_CONFIG
    const validModules = ['dashboard', 'configuration', 'monitoring', 'incident', 'service'];
    if (!validModules.includes(currentModule)) {
      currentModule = 'dashboard';
    }
    
    this.storeService.setCurrentModule(currentModule);
  }
}