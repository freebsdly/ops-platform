import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, BehaviorSubject, catchError, tap } from 'rxjs';
import { LayoutConfig, LogoConfig, DEFAULT_LAYOUT_CONFIG } from '../types/layout-config.interface';

/**
 * 配置服务 - 负责从后端加载和管理应用配置
 */
@Injectable({
  providedIn: 'root',
})
export class ConfigService {
  private http = inject(HttpClient);
  
  /**
   * API基础URL - 使用相对路径，MSW会拦截
   */
  private readonly API_BASE_URL = '/api';
  
  /**
   * 当前布局配置
   */
  private layoutConfigSubject = new BehaviorSubject<LayoutConfig>(DEFAULT_LAYOUT_CONFIG);
  
  /**
   * 布局配置可观察对象
   */
  layoutConfig$ = this.layoutConfigSubject.asObservable();
  
  /**
   * 配置加载状态
   */
  private loadingSubject = new BehaviorSubject<boolean>(false);
  loading$ = this.loadingSubject.asObservable();
  
  /**
   * 配置加载错误
   */
  private errorSubject = new BehaviorSubject<string | null>(null);
  error$ = this.errorSubject.asObservable();
  
  /**
   * 配置缓存键
   */
  private readonly CONFIG_CACHE_KEY = 'app_layout_config';
  private readonly CONFIG_CACHE_TIMESTAMP_KEY = 'app_layout_config_timestamp';
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5分钟缓存
  
  /**
   * 从后端加载布局配置
   * @param forceRefresh 是否强制刷新（忽略缓存）
   */
  loadLayoutConfig(forceRefresh: boolean = false): Observable<LayoutConfig> {
    // 检查缓存
    if (!forceRefresh) {
      const cachedConfig = this.getCachedConfig();
      if (cachedConfig) {
        console.log('ConfigService: 使用缓存配置');
        this.layoutConfigSubject.next(cachedConfig);
        return of(cachedConfig);
      }
    }
    
    // 设置加载状态
    console.log('ConfigService: 从API加载配置...');
    this.loadingSubject.next(true);
    this.errorSubject.next(null);
    
    const apiUrl = `${this.API_BASE_URL}/config/layout`;
    console.log(`ConfigService: 请求URL: ${apiUrl}`);
    
    return this.http.get<LayoutConfig>(apiUrl).pipe(
      tap((config) => {
        console.log('ConfigService: API响应成功:', {
          appTitle: config.appTitle,
          hasData: !!config
        });
        this.layoutConfigSubject.next(config);
        this.cacheConfig(config);
        this.loadingSubject.next(false);
      }),
      catchError((error) => {
        console.error('ConfigService: 加载配置失败:', error);
        this.errorSubject.next(error.message || 'Failed to load configuration');
        this.loadingSubject.next(false);
        
        // 使用默认配置作为回退
        console.log('ConfigService: 使用默认配置作为回退');
        this.layoutConfigSubject.next(DEFAULT_LAYOUT_CONFIG);
        return of(DEFAULT_LAYOUT_CONFIG);
      })
    );
  }
  
  /**
   * 获取当前布局配置
   */
  getLayoutConfig(): LayoutConfig {
    return this.layoutConfigSubject.value;
  }
  
  /**
   * 更新布局配置
   * @param config 新的布局配置
   */
  updateLayoutConfig(config: Partial<LayoutConfig>): void {
    const currentConfig = this.layoutConfigSubject.value;
    const newConfig = { ...currentConfig, ...config };
    this.layoutConfigSubject.next(newConfig);
    this.cacheConfig(newConfig);
    
    // 实际项目中应该发送到后端保存
    // this.saveLayoutConfig(newConfig).subscribe();
  }
  
  /**
   * 保存布局配置到后端
   */
  saveLayoutConfig(config: LayoutConfig): Observable<LayoutConfig> {
    return this.http.post<LayoutConfig>(`${this.API_BASE_URL}/config/layout`, config).pipe(
      tap((savedConfig) => {
        this.layoutConfigSubject.next(savedConfig);
        this.cacheConfig(savedConfig);
      })
    );
  }
  
  /**
   * 重置为默认配置
   */
  resetToDefault(): void {
    this.layoutConfigSubject.next(DEFAULT_LAYOUT_CONFIG);
    this.cacheConfig(DEFAULT_LAYOUT_CONFIG);
    
    // 清除缓存，强制下次从后端加载
    this.clearCache();
  }
  
  /**
   * 获取Logo配置
   */
  getLogoConfig() {
    return this.layoutConfigSubject.value.logo;
  }
  
  /**
   * 获取应用标题
   */
  getAppTitle(): string {
    return this.layoutConfigSubject.value.appTitle;
  }
  
  /**
   * 获取侧边栏配置
   */
  getSidebarConfig() {
    return this.layoutConfigSubject.value.sidebar;
  }
  
  /**
   * 获取主题配置
   */
  getThemeConfig() {
    return this.layoutConfigSubject.value.theme;
  }
  
  /**
   * 获取页头配置
   */
  getHeaderConfig() {
    return this.layoutConfigSubject.value.header;
  }
  
  /**
   * 获取应用配置
   */
  getAppConfig(): Observable<{
    version: string;
    environment: string;
    apiUrl: string;
    features: Record<string, boolean>;
  }> {
    return this.http.get<{
      version: string;
      environment: string;
      apiUrl: string;
      features: Record<string, boolean>;
    }>(`${this.API_BASE_URL}/config/app`);
  }

  /**
   * 验证配置
   */
  validateConfig(config: Partial<LayoutConfig>): Observable<{
    valid: boolean;
    errors: string[];
  }> {
    return this.http.post<{
      valid: boolean;
      errors: string[];
    }>(`${this.API_BASE_URL}/config/validate`, config);
  }

  /**
   * 获取Logo配置（直接API调用）
   */
  getLogoConfigFromApi(): Observable<LogoConfig> {
    return this.http.get<LogoConfig>(`${this.API_BASE_URL}/config/logo`);
  }

  /**
   * 获取主题配置（直接API调用）
   */
  getThemeConfigFromApi(): Observable<typeof DEFAULT_LAYOUT_CONFIG.theme> {
    return this.http.get<typeof DEFAULT_LAYOUT_CONFIG.theme>(`${this.API_BASE_URL}/config/theme`);
  }

  /**
   * 获取侧边栏配置（直接API调用）
   */
  getSidebarConfigFromApi(): Observable<typeof DEFAULT_LAYOUT_CONFIG.sidebar> {
    return this.http.get<typeof DEFAULT_LAYOUT_CONFIG.sidebar>(`${this.API_BASE_URL}/config/sidebar`);
  }

  /**
   * 获取页头配置（直接API调用）
   */
  getHeaderConfigFromApi(): Observable<typeof DEFAULT_LAYOUT_CONFIG.header> {
    return this.http.get<typeof DEFAULT_LAYOUT_CONFIG.header>(`${this.API_BASE_URL}/config/header`);
  }

  /**
   * 获取页脚配置（直接API调用）
   */
  getFooterConfigFromApi(): Observable<typeof DEFAULT_LAYOUT_CONFIG.footer> {
    return this.http.get<typeof DEFAULT_LAYOUT_CONFIG.footer>(`${this.API_BASE_URL}/config/footer`);
  }
  
  /**
   * 更新Logo配置
   */
  updateLogoConfig(logoConfig: Partial<LogoConfig>): void {
    const currentConfig = this.layoutConfigSubject.value;
    const updatedLogo = { ...currentConfig.logo, ...logoConfig };
    this.updateLayoutConfig({ logo: updatedLogo });
  }
  
  /**
   * 更新应用标题
   */
  updateAppTitle(title: string): void {
    this.updateLayoutConfig({ appTitle: title });
  }
  
  /**
   * 检查配置是否已加载
   */
  isConfigLoaded(): boolean {
    return this.layoutConfigSubject.value !== DEFAULT_LAYOUT_CONFIG || 
           this.getCachedConfig() !== null;
  }
  
  /**
   * 缓存配置到本地存储
   */
  private cacheConfig(config: LayoutConfig): void {
    try {
      localStorage.setItem(this.CONFIG_CACHE_KEY, JSON.stringify(config));
      localStorage.setItem(this.CONFIG_CACHE_TIMESTAMP_KEY, Date.now().toString());
    } catch (error) {
      console.warn('Failed to cache config:', error);
    }
  }
  
  /**
   * 从本地存储获取缓存的配置
   */
  private getCachedConfig(): LayoutConfig | null {
    try {
      const cached = localStorage.getItem(this.CONFIG_CACHE_KEY);
      const timestamp = localStorage.getItem(this.CONFIG_CACHE_TIMESTAMP_KEY);
      
      if (!cached || !timestamp) {
        return null;
      }
      
      const cacheTime = parseInt(timestamp, 10);
      const now = Date.now();
      
      // 检查缓存是否过期
      if (now - cacheTime > this.CACHE_DURATION) {
        this.clearCache();
        return null;
      }
      
      return JSON.parse(cached) as LayoutConfig;
    } catch (error) {
      console.warn('Failed to read cached config:', error);
      this.clearCache();
      return null;
    }
  }
  
  /**
   * 清除缓存
   */
  private clearCache(): void {
    try {
      localStorage.removeItem(this.CONFIG_CACHE_KEY);
      localStorage.removeItem(this.CONFIG_CACHE_TIMESTAMP_KEY);
    } catch (error) {
      console.warn('Failed to clear cache:', error);
    }
  }
}