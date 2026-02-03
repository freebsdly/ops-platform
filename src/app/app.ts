import { Component, inject, OnInit, computed, signal, OnDestroy } from '@angular/core';
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
import { Search } from './layout/search/search';
import { SiderHeader } from './layout/sider-header/sider-header';
import { SiderMenu } from './layout/sider-menu/sider-menu';
import { SiderFooter } from './layout/sider-footer/sider-footer';
import { toSignal } from '@angular/core/rxjs-interop';
import { filter, takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
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
    Loading,
    Search,
    SiderHeader,
    SiderMenu,
    SiderFooter
  ],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App implements OnInit, OnDestroy {
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
  
  // Config signals - 单次获取完整配置
  layoutConfigSig = toSignal(this.storeService.layoutConfig$);
  configLoadingSig = toSignal(this.storeService.configLoading$);
  configLoadedSig = toSignal(this.storeService.configLoaded$);
  
  // 派生配置信号 - 从完整配置中提取
  appTitleSig = computed(() => this.layoutConfigSig()?.appTitle || 'Ops Platform');
  logoSrcSig = computed(() => this.layoutConfigSig()?.logo?.src || 'https://ng.ant.design/assets.img/logo.svg');
  logoAltSig = computed(() => this.layoutConfigSig()?.logo?.alt || 'Logo');
  logoLinkSig = computed(() => this.layoutConfigSig()?.logo?.link || 'https://ng.ant.design/');
  logoCollapsedIconSig = computed(() => this.layoutConfigSig()?.logo?.collapsedIcon || 'bars');
  logoExpandedIconSig = computed(() => this.layoutConfigSig()?.logo?.expandedIcon || 'bars');
  
  // Track if auth check is in progress
  isAuthChecking = signal<boolean>(true);

  // For cleanup
  private destroy$ = new Subject<void>();

  ngOnInit(): void {
    // Initialize current path from router
    this.currentPath.set(this.router.url);

    // Subscribe to route changes to track current path
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd),
      takeUntil(this.destroy$)
    ).subscribe((event: NavigationEnd) => {
      const oldPath = this.currentPath();
      const newPath = event.url;

      this.currentPath.set(newPath);

      // If user navigates away from login page and is authenticated, load resources
      if (this.isLoginPage(oldPath) && !this.isLoginPage(newPath) && this.isAuthenticatedSig()) {
        this.loadUserResources();
      }
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
        // 用户已认证且不在登录页，才加载配置和模块
        if (!this.isLoginPage(this.router.url)) {
          this.loadUserResources();
        }
      }, 50);
    } else {
      // No token, wait for NgRx to confirm not authenticated
      this.storeService.isLoading$.pipe(
        takeUntil(this.destroy$)
      ).subscribe(isLoading => {
        if (!isLoading) {
          this.isAuthChecking.set(false);
        }
      });

      // 监听认证状态变化，当用户登录成功后加载配置
      this.storeService.isAuthenticated$.pipe(
        takeUntil(this.destroy$)
      ).subscribe(isAuthenticated => {
        if (isAuthenticated) {
          // 用户登录成功，加载配置和模块
          this.loadUserResources();
        }
      });

      // Set a fallback timeout to prevent hanging
      setTimeout(() => {
        this.isAuthChecking.set(false);
      }, 2000);
    }

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

  // Flag to track if user resources have been loaded
  private resourcesLoaded = false;

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * 加载用户相关资源（配置和模块）
   * 只在用户认证成功后调用
   * 避免重复加载
   */
  private loadUserResources(): void {
    if (this.resourcesLoaded) {
      return;
    }

    // Load configuration
    this.storeService.loadConfig();

    // Load available modules
    this.storeService.loadModules();

    this.resourcesLoaded = true;
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