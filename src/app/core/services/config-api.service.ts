import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { LayoutConfig, DEFAULT_LAYOUT_CONFIG } from '../types/layout-config.interface';

/**
 * 模拟配置API服务
 * 在实际项目中，这里应该调用真实的后端API
 */
@Injectable({
  providedIn: 'root',
})
export class ConfigApiService {
  // 模拟配置数据 - 在实际项目中应该从后端获取
  private mockConfig: LayoutConfig = {
    ...DEFAULT_LAYOUT_CONFIG,
    appTitle: 'DevOps Ops Platform',
    logo: {
      ...DEFAULT_LAYOUT_CONFIG.logo,
      src: 'https://img.icons8.com/color/96/000000/administrative-tools.png',
      alt: 'DevOps Tools Logo',
      link: '/',
      width: '32px',
      height: '32px',
      visible: true,
      collapsedIcon: 'tool',
      expandedIcon: 'tool'
    },
    theme: {
      ...DEFAULT_LAYOUT_CONFIG.theme,
      mode: 'light',
      primaryColor: '#1890ff',
      secondaryColor: '#52c41a'
    },
    sidebar: {
      ...DEFAULT_LAYOUT_CONFIG.sidebar,
      width: 220,
      backgroundColor: '#001529',
      textColor: '#ffffff'
    },
    header: {
      ...DEFAULT_LAYOUT_CONFIG.header,
      showBreadcrumb: true,
      showUserInfo: true,
      showLangSelector: true,
      showThemeSwitcher: true
    },
    footer: {
      ...DEFAULT_LAYOUT_CONFIG.footer,
      content: '© 2024 DevOps Ops Platform. Powered by Angular & Ant Design.',
      visible: true
    }
  };

  /**
   * 从API获取布局配置
   */
  getLayoutConfig(): Observable<LayoutConfig> {
    // 模拟API延迟
    return of(this.mockConfig).pipe(
      delay(300)
    );
  }

  /**
   * 保存布局配置到API
   */
  saveLayoutConfig(config: LayoutConfig): Observable<LayoutConfig> {
    // 模拟API保存并返回更新后的配置
    this.mockConfig = { ...config };
    return of(this.mockConfig).pipe(
      delay(200)
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
    }).pipe(
      delay(150)
    );
  }

  /**
   * 获取Logo配置
   */
  getLogoConfig(): Observable<typeof DEFAULT_LAYOUT_CONFIG.logo> {
    return of(this.mockConfig.logo).pipe(
      delay(100)
    );
  }

  /**
   * 获取主题配置
   */
  getThemeConfig(): Observable<typeof DEFAULT_LAYOUT_CONFIG.theme> {
    return of(this.mockConfig.theme).pipe(
      delay(100)
    );
  }

  /**
   * 获取侧边栏配置
   */
  getSidebarConfig(): Observable<typeof DEFAULT_LAYOUT_CONFIG.sidebar> {
    return of(this.mockConfig.sidebar).pipe(
      delay(100)
    );
  }

  /**
   * 获取页头配置
   */
  getHeaderConfig(): Observable<typeof DEFAULT_LAYOUT_CONFIG.header> {
    return of(this.mockConfig.header).pipe(
      delay(100)
    );
  }

  /**
   * 获取页脚配置
   */
  getFooterConfig(): Observable<typeof DEFAULT_LAYOUT_CONFIG.footer> {
    return of(this.mockConfig.footer).pipe(
      delay(100)
    );
  }

  /**
   * 验证配置
   */
  validateConfig(config: Partial<LayoutConfig>): Observable<{
    valid: boolean;
    errors: string[];
  }> {
    const errors: string[] = [];

    // 简单的验证逻辑
    if (config.appTitle && config.appTitle.length > 100) {
      errors.push('应用标题不能超过100个字符');
    }

    if (config.logo?.src && !this.isValidUrl(config.logo.src)) {
      errors.push('Logo图片URL格式无效');
    }

    return of({
      valid: errors.length === 0,
      errors
    }).pipe(
      delay(100)
    );
  }

  /**
   * 检查URL是否有效
   */
  private isValidUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }
}