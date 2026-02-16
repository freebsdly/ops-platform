import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, BehaviorSubject, catchError, tap, map, throwError } from 'rxjs';
import { LayoutConfig, LogoConfig } from '../types/layout-config.interface';
import { AppConfigResponse, ConfigValidationResponse } from '../types/api-response.interface';

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
  private layoutConfigSubject = new BehaviorSubject<LayoutConfig | null>(null);
  
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
    // 检查是否有认证token，如果没有token，直接报错
    const token = localStorage.getItem('auth_token');
    if (!token) {
      const error = new Error('未找到认证令牌，请重新登录');
      this.errorSubject.next(error.message);
      return throwError(() => error);
    }
    
    // 检查缓存
    if (!forceRefresh) {
      const cachedConfig = this.getCachedConfig();
      if (cachedConfig) {
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
        this.layoutConfigSubject.next(config);
        this.cacheConfig(config);
        this.loadingSubject.next(false);
      }),
      catchError((error) => {
        const errorMessage = this.getErrorMessage(error);
        this.errorSubject.next(errorMessage);
        this.loadingSubject.next(false);
        
        // 直接抛出错误，不再使用默认配置
        return throwError(() => new Error(errorMessage));
      })
    );
  }
  
  /**
   * 获取当前布局配置
   */
  getLayoutConfig(): LayoutConfig | null {
    return this.layoutConfigSubject.value;
  }
  
  /**
   * 更新布局配置
   * @param config 新的布局配置
   */
  updateLayoutConfig(config: Partial<LayoutConfig>): void {
    const currentConfig = this.layoutConfigSubject.value;
    if (!currentConfig) {
      console.error('Cannot update config: current config is null');
      return;
    }
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
   * 重置配置
   */
  resetConfig(): void {
    this.layoutConfigSubject.next(null);
    this.clearCache();
  }
  
  /**
   * 获取Logo配置
   */
  getLogoConfig() {
    const config = this.layoutConfigSubject.value;
    return config?.logo;
  }
  
  /**
   * 获取应用标题
   */
  getAppTitle(): string | null {
    const config = this.layoutConfigSubject.value;
    return config?.appTitle || null;
  }
  
  /**
   * 获取侧边栏配置
   */
  getSidebarConfig() {
    const config = this.layoutConfigSubject.value;
    return config?.sidebar;
  }
  
  /**
   * 获取主题配置
   */
  getThemeConfig() {
    const config = this.layoutConfigSubject.value;
    return config?.theme;
  }
  
  /**
   * 获取页头配置
   */
  getHeaderConfig() {
    const config = this.layoutConfigSubject.value;
    return config?.header;
  }
  
  /**
   * 获取应用配置
   */
  getAppConfig(): Observable<AppConfigResponse> {
    return this.http.get<AppConfigResponse>(`${this.API_BASE_URL}/config/app`);
  }

  /**
   * 验证配置
   */
  validateConfig(config: Partial<LayoutConfig>): Observable<ConfigValidationResponse> {
    return this.http.post<ConfigValidationResponse>(`${this.API_BASE_URL}/config/validate`, config);
  }

  /**
   * 更新Logo配置
   */
  updateLogoConfig(logoConfig: Partial<LogoConfig>): void {
    const currentConfig = this.layoutConfigSubject.value;
    if (!currentConfig) {
      console.error('Cannot update logo config: current config is null');
      return;
    }
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
    return this.layoutConfigSubject.value !== null || 
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

  /**
   * 获取友好的错误消息
   */
  private getErrorMessage(error: any): string {
    if (!error) {
      return '配置加载失败';
    }
    
    if (error.status === 401) {
      return '认证失败，请重新登录';
    } else if (error.status === 403) {
      return '权限不足，无法加载配置';
    } else if (error.status === 404) {
      return '配置接口不存在';
    } else if (error.status === 0 || error.status === 500) {
      return '服务器错误，请稍后重试';
    } else if (error.error?.error) {
      return `服务器错误: ${error.error.error}`;
    } else if (error.message) {
      return error.message;
    } else if (error.statusText) {
      return `网络错误: ${error.statusText}`;
    }
    
    return '配置加载失败，未知错误';
  }
}