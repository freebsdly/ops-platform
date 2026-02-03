import { Injectable, inject } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay, catchError } from 'rxjs/operators';
import { LayoutConfig, DEFAULT_LAYOUT_CONFIG } from '../types/layout-config.interface';
import { ConfigService } from './config.service';

/**
 * 配置API服务 - 基于ConfigService调用
 */
@Injectable({
  providedIn: 'root',
})
export class ConfigApiService {
  private configService = inject(ConfigService);

  /**
   * 从API获取布局配置
   */
  getLayoutConfig(): Observable<LayoutConfig> {
    return this.configService.loadLayoutConfig().pipe(
      catchError(error => {
        console.error('获取布局配置失败:', error);
        // 返回默认配置作为回退
        return of(DEFAULT_LAYOUT_CONFIG);
      })
    );
  }

  /**
   * 保存布局配置到API
   */
  saveLayoutConfig(config: LayoutConfig): Observable<LayoutConfig> {
    return this.configService.saveLayoutConfig(config).pipe(
      catchError(error => {
        console.error('保存布局配置失败:', error);
        // 返回原配置作为回退
        return of(config);
      })
    );
  }

  /**
   * 获取应用特定配置
   */
  getAppConfig(): Observable<{
    version: string;
    environment: string;
    apiUrl: string;
    features: Record<string, boolean>;
  }> {
    return this.configService.getAppConfig().pipe(
      catchError(error => {
        console.error('获取应用配置失败:', error);
        // 返回默认应用配置作为回退
        return of({
          version: '1.2.0',
          environment: 'development',
          apiUrl: 'http://localhost:3000/api',
          features: {
            multiTenancy: true,
            auditLog: true,
            notifications: true,
            darkMode: true
          }
        });
      })
    );
  }

  /**
   * 获取Logo配置
   */
  getLogoConfig(): Observable<typeof DEFAULT_LAYOUT_CONFIG.logo> {
    return this.configService.getLogoConfigFromApi().pipe(
      catchError(error => {
        console.error('获取Logo配置失败:', error);
        // 返回默认Logo配置作为回退
        return of(DEFAULT_LAYOUT_CONFIG.logo);
      })
    );
  }

  /**
   * 获取主题配置
   */
  getThemeConfig(): Observable<typeof DEFAULT_LAYOUT_CONFIG.theme> {
    return this.configService.getThemeConfigFromApi().pipe(
      catchError(error => {
        console.error('获取主题配置失败:', error);
        // 返回默认主题配置作为回退
        return of(DEFAULT_LAYOUT_CONFIG.theme);
      })
    );
  }

  /**
   * 获取侧边栏配置
   */
  getSidebarConfig(): Observable<typeof DEFAULT_LAYOUT_CONFIG.sidebar> {
    return this.configService.getSidebarConfigFromApi().pipe(
      catchError(error => {
        console.error('获取侧边栏配置失败:', error);
        // 返回默认侧边栏配置作为回退
        return of(DEFAULT_LAYOUT_CONFIG.sidebar);
      })
    );
  }

  /**
   * 获取页头配置
   */
  getHeaderConfig(): Observable<typeof DEFAULT_LAYOUT_CONFIG.header> {
    return this.configService.getHeaderConfigFromApi().pipe(
      catchError(error => {
        console.error('获取页头配置失败:', error);
        // 返回默认页头配置作为回退
        return of(DEFAULT_LAYOUT_CONFIG.header);
      })
    );
  }

  /**
   * 获取页脚配置
   */
  getFooterConfig(): Observable<typeof DEFAULT_LAYOUT_CONFIG.footer> {
    return this.configService.getFooterConfigFromApi().pipe(
      catchError(error => {
        console.error('获取页脚配置失败:', error);
        // 返回默认页脚配置作为回退
        return of(DEFAULT_LAYOUT_CONFIG.footer);
      })
    );
  }

  /**
   * 验证配置
   */
  validateConfig(config: Partial<LayoutConfig>): Observable<{
    valid: boolean;
    errors: string[];
  }> {
    return this.configService.validateConfig(config).pipe(
      catchError(error => {
        console.error('验证配置失败:', error);
        // 返回验证失败作为回退
        return of({
          valid: false,
          errors: ['验证服务暂时不可用']
        });
      })
    );
  }
}