import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, BehaviorSubject, catchError, tap, throwError } from 'rxjs';
import { LayoutConfig, LogoConfig, DEFAULT_LAYOUT_CONFIG } from '../types/layout-config.interface';
import { ConfigApiService } from './config-api.service';

/**
 * 配置服务 - 负责从后端加载和管理应用配置
 */
@Injectable({
  providedIn: 'root',
})
export class ConfigService {
  private http = inject(HttpClient);
  private configApiService = inject(ConfigApiService);
  
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
        this.layoutConfigSubject.next(cachedConfig);
        return of(cachedConfig);
      }
    }
    
    // 设置加载状态
    this.loadingSubject.next(true);
    this.errorSubject.next(null);
    
    // 使用模拟API服务
    return this.configApiService.getLayoutConfig().pipe(
      tap((config) => {
        this.layoutConfigSubject.next(config);
        this.cacheConfig(config);
        this.loadingSubject.next(false);
      }),
      catchError((error) => {
        console.error('Failed to load layout config:', error);
        this.errorSubject.next(error.message || 'Failed to load configuration');
        this.loadingSubject.next(false);
        
        // 使用默认配置作为回退
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
    // 使用模拟API服务
    return this.configApiService.saveLayoutConfig(config).pipe(
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
   * 获取页脚配置
   */
  getFooterConfig() {
    return this.layoutConfigSubject.value.footer;
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