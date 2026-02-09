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
import { AppTabBar } from './layout/tabs/tabs';
import { toSignal } from '@angular/core/rxjs-interop';
import { filter, takeUntil, map } from 'rxjs/operators';
import { Subject, Subscription, combineLatest } from 'rxjs';
import { AuthService } from './services/auth.service';
import { MODULES_CONFIG } from './config/menu.config';

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
    SiderFooter,
    AppTabBar
  ],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App implements OnInit, OnDestroy {
  logoSrc = 'https://img.icons8.com/color/96/000000/administrative-tools.png';
  logoAlt = 'DevOps Platform';
  title = 'DevOps Platform';
  logoLink = '/';

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
  
  // Config state signals
  private configSubscription: Subscription | null = null;
  private layoutConfigSignal = signal<any>(null);
  private configLoadingSignal = signal<boolean>(false);
  private configLoadedSignal = signal<boolean>(false);
  
  // Public config signals
  layoutConfigSig = this.layoutConfigSignal.asReadonly();
  configLoadingSig = this.configLoadingSignal.asReadonly();
  configLoadedSig = this.configLoadedSignal.asReadonly();
  
  // 是否应该初始显示布局（避免闪烁）
  shouldShowLayoutInitially = computed(() => {
    // 如果有本地token，我们假设用户是认证的，直到异步验证完成
    const hasLocalToken = !!this.initialAuthState.token;
    return hasLocalToken;
  });
  
  // Use computed signal to determine if we should show layout
  showLayout = computed(() => {
    const isAuthenticated = this.isAuthenticatedSig();
    const path = this.currentPath();
    const isLoginPage = this.isLoginPage(path);
    const initiallyShow = this.shouldShowLayoutInitially();
    
    // 如果用户认证成功，或者有本地token且不在登录页，就显示布局
    // 这样可以避免刷新时的闪烁
    return (isAuthenticated || initiallyShow) && !isLoginPage;
  });
  
  // 派生配置信号 - 使用safe computed
  appTitleSig = computed(() => {
    const config = this.layoutConfigSig();
    return config?.appTitle || 'DevOps Platform';
  });
  
  logoSrcSig = computed(() => {
    const config = this.layoutConfigSig();
    return config?.logo?.src || 'https://img.icons8.com/color/96/000000/administrative-tools.png';
  });
  
  logoAltSig = computed(() => {
    const config = this.layoutConfigSig();
    return config?.logo?.alt || 'DevOps Platform';
  });
  
  logoLinkSig = computed(() => {
    const config = this.layoutConfigSig();
    return config?.logo?.link || '/';
  });
  
  logoCollapsedIconSig = computed(() => {
    const config = this.layoutConfigSig();
    return config?.logo?.collapsedIcon || 'tool';
  });
  
  logoExpandedIconSig = computed(() => {
    const config = this.layoutConfigSig();
    return config?.logo?.expandedIcon || 'tool';
  });
  
  // 是否显示应用底部（app footer）
  showAppFooterSig = computed(() => {
    const config = this.layoutConfigSig();
    return config?.footer?.visible ?? false;
  });
  
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

      console.log(`路由变化: ${oldPath} -> ${newPath}`);
      this.currentPath.set(newPath);
      
      // 管理config订阅
      this.manageConfigSubscription();

      // If user navigates away from login page and is authenticated, load resources
      // 只有当认证检查完成且用户认证有效且不在登录页时才加载资源
      const isAuthChecking = this.isAuthChecking();
      const isAuthenticated = this.isAuthenticatedSig();
      const isLoginPageOld = this.isLoginPage(oldPath);
      const isLoginPageNew = this.isLoginPage(newPath);
           
      if (isLoginPageOld && !isLoginPageNew && !isAuthChecking && isAuthenticated) {
        this.loadUserResources();
      }
    });

    // Check authentication status on app initialization
    this.storeService.checkAuth();

    // Determine initial auth checking state
    // If we have a token from localStorage, we can mark auth check as complete quickly
    // This prevents the flash when refreshing authenticated pages
    const initialPath = this.currentPath();
    const isInitiallyOnLoginPage = this.isLoginPage(initialPath);
    
    
    if (this.initialAuthState.token && !isInitiallyOnLoginPage) {
      setTimeout(() => {
        this.isAuthChecking.set(false);
        const currentPath = this.currentPath();
        if (this.isAuthenticatedSig() && !this.isLoginPage(currentPath)) {
          this.loadUserResources();
        }
      }, 50);
    } else {
      this.storeService.isLoading$.pipe(
        takeUntil(this.destroy$)
      ).subscribe(isLoading => {
        if (!isLoading) {
          this.isAuthChecking.set(false);
        }
      });

      // 监听认证状态变化
      this.storeService.isAuthenticated$.pipe(
        takeUntil(this.destroy$)
      ).subscribe(isAuthenticated => {
       // 管理config订阅
        this.manageConfigSubscription();
        
        if (isAuthenticated) {
          // 用户登录成功，检查是否在登录页
          if (!this.isLoginPage(this.currentPath())) {
            this.loadUserResources();
          }
        } else {
          // 用户登出，重置资源加载状态
          this.resourcesLoaded = false;
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

    // Load config from cache if available
    this.loadConfigFromCache();

    // Set current module based on initial URL
    this.setInitialModule();
  }

  // Flag to track if user resources have been loaded
  private resourcesLoaded = false;

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.unsubscribeConfig();
  }

  /**
   * 订阅config observables
   * 只在需要时调用（认证用户访问非登录页）
   */
  private subscribeConfig(): void {
    if (this.configSubscription) {
      // 已订阅
      return;
    }
    
    // 组合订阅多个observables
    this.configSubscription = new Subscription();
    
    // 订阅layout配置
    this.configSubscription.add(
      this.storeService.layoutConfig$.subscribe(config => {
        this.layoutConfigSignal.set(config);
      })
    );
    
    // 订阅配置加载状态
    this.configSubscription.add(
      this.storeService.configLoading$.subscribe(loading => {
        this.configLoadingSignal.set(loading);
      })
    );
    
    // 订阅配置加载完成状态
    this.configSubscription.add(
      this.storeService.configLoaded$.subscribe(loaded => {
        this.configLoadedSignal.set(loaded);
      })
    );
  }

  /**
   * 取消订阅config observables
   * 在登出或导航到登录页时调用
   */
  private unsubscribeConfig(): void {
    if (this.configSubscription) {
      this.configSubscription.unsubscribe();
      this.configSubscription = null;
      
      // 重置信号
      this.layoutConfigSignal.set(null);
      this.configLoadingSignal.set(false);
      this.configLoadedSignal.set(false);
    }
  }

  /**
   * 管理config订阅
   * 根据认证状态和当前页面决定是否需要订阅
   */
  private manageConfigSubscription(): void {
    const shouldHaveLayout = this.showLayout();
    
    if (shouldHaveLayout) {
      // 应该显示layout，确保订阅了config
      this.subscribeConfig();
    } else {
      // 不应该显示layout，取消订阅config
      this.unsubscribeConfig();
    }
  }

  /**
   * 加载用户相关资源（配置和模块）
   * 只在用户认证成功后调用
   * 避免重复加载
   */
  private loadUserResources(): void {   
    // 再次检查是否在登录页，作为最后一道防线
    if (this.isLoginPage(this.currentPath())) {
      return;
    }
    
    if (!this.isAuthenticatedSig()) {
      return; // 用户未认证，不加载资源
    }
    
    if (this.resourcesLoaded) {
      return;
    }
    
    // Load configuration
    this.storeService.loadConfig();

    // Load available modules
    this.storeService.loadModules();

    this.resourcesLoaded = true;
  }

  // 在应用初始化时从缓存加载配置
  private loadConfigFromCache(): void {
    try {
      const cached = localStorage.getItem('app_layout_config');
      if (cached) {
        const config = JSON.parse(cached);
        this.layoutConfigSignal.set(config);
      }
    } catch (error) {
      console.warn('Failed to load config from cache:', error);
    }
  }

  isLoginPage(path?: string): boolean {
    const url = path || this.currentPath();
    const isLogin = url === '/login' || url.startsWith('/login?');
    return isLogin;
  }

  private setInitialModule(): void {
    const url = this.currentPath();
    const segments = url.split('/').filter(segment => segment.length > 0);
    
    // Default to dashboard if no segments
    let currentModule = segments[0] || 'dashboard';
    
    // Check if it's a valid module from MODULES_CONFIG
    const validModuleIds = MODULES_CONFIG.map(module => module.id);
    if (!validModuleIds.includes(currentModule)) {
      currentModule = 'dashboard';
    }
    
    console.log(`[App] Initial URL: ${url}, setting initial module: ${currentModule}`);
    this.storeService.setCurrentModule(currentModule);
  }
}