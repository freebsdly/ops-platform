import { Component, inject, OnInit, computed, signal } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzLayoutModule } from 'ng-zorro-antd/layout';
import { Sider } from './layout/sider/sider';
import { LayoutService } from './layout.service';
import { CollapseButton } from './layout/collapse-button/collapse-button';
import { UserInfo } from './layout/user-info/user-info';
import { LangSelector } from './layout/lang-selector/lang-selector';
import { ModuleSelector } from './layout/module-selector/module-selector';
import { StoreService } from './core/stores/store.service';
import { Loading } from './layout/loading/loading';
import { toSignal } from '@angular/core/rxjs-interop';
import { filter } from 'rxjs/operators';
import { AuthService } from './services/auth.service';

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
    Loading
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
  private authService = inject(AuthService);
  
  // Track current route path as a signal
  currentPath = signal<string>('');

  // Initial authentication state from localStorage (synchronous)
  private initialAuthState = this.authService.checkAuthSync();
  
  // NgRx state observables converted to signals
  isAuthenticatedSig = toSignal(this.storeService.isAuthenticated$, { initialValue: !!this.initialAuthState.token });
  userSig = toSignal(this.storeService.user$, { initialValue: this.initialAuthState.user });
  isSiderCollapsedSig = toSignal(this.storeService.isSiderCollapsed$, { initialValue: false });
  
  // Config signals
  layoutConfigSig = toSignal(this.storeService.layoutConfig$);
  appTitleSig = toSignal(this.storeService.appTitle$);
  logoSrcSig = toSignal(this.storeService.logoSrc$);
  logoAltSig = toSignal(this.storeService.logoAlt$);
  logoLinkSig = toSignal(this.storeService.logoLink$);
  configLoadingSig = toSignal(this.storeService.configLoading$);
  configLoadedSig = toSignal(this.storeService.configLoaded$);
  
  // Track if auth check is in progress
  isAuthChecking = signal<boolean>(true);

  ngOnInit(): void {
    // Initialize current path from router
    this.currentPath.set(this.router.url);
    
    // Subscribe to route changes to track current path
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {
      this.currentPath.set(event.url);
    });
    
    // Check authentication status on app initialization
    this.storeService.checkAuth();
    
    // Determine initial auth checking state
    // If we have a token from localStorage, we can mark auth check as complete quickly
    // This prevents the flash when refreshing authenticated pages
    if (this.initialAuthState.token) {
      // We have a token, so user is authenticated
      // Wait a very short time for any immediate NgRx updates, then mark as done
      setTimeout(() => {
        this.isAuthChecking.set(false);
      }, 50);
    } else {
      // No token, wait for NgRx to confirm not authenticated
      this.storeService.isLoading$.subscribe(isLoading => {
        if (!isLoading) {
          this.isAuthChecking.set(false);
        }
      });
      
      // Set a fallback timeout to prevent hanging
      setTimeout(() => {
        this.isAuthChecking.set(false);
      }, 2000);
    }
    
    // Load configuration
    this.storeService.loadConfig();
    
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

  // Use computed signal to determine if we should show layout
  showLayout = computed(() => {
    const isAuthenticated = this.isAuthenticatedSig();
    const path = this.currentPath();
    const isLoginPage = this.isLoginPage(path);
    const isAuthChecking = this.isAuthChecking();
    
    // If we're checking auth, only show layout if we're definitely authenticated
    // This prevents flash for unauthenticated users
    if (isAuthChecking) {
      // While checking, only show layout if we have a token AND not on login page
      // This prevents the flash where layout appears then disappears
      const hasToken = this.initialAuthState.token;
      return hasToken && !isLoginPage;
    }
    
    // When auth check is complete, use the NgRx state
    return isAuthenticated && !isLoginPage;
  });

  isLoginPage(path?: string): boolean {
    const url = path || this.currentPath();
    return url === '/login' || url.startsWith('/login?');
  }

  private setInitialModule(): void {
    const url = this.currentPath();
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