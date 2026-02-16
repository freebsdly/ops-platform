import { Injectable, inject } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { delay, catchError, map } from 'rxjs/operators';
import { LayoutConfig } from '../types/layout-config.interface';
import { ConfigService } from './config.service';
import { AppConfigResponse, ConfigValidationResponse } from '../types/api-response.interface';

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
        // 直接抛出错误，不再返回默认配置
        return throwError(() => error);
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
  getAppConfig(): Observable<AppConfigResponse> {
    return this.configService.getAppConfig().pipe(
      catchError(error => {
        console.error('获取应用配置失败:', error);
        // 返回默认应用配置作为回退
        return of<AppConfigResponse>({
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
   * 验证配置
   */
  validateConfig(config: Partial<LayoutConfig>): Observable<ConfigValidationResponse> {
    return this.configService.validateConfig(config).pipe(
      catchError(error => {
        console.error('验证配置失败:', error);
        // 返回验证失败作为回退
        return of<ConfigValidationResponse>({
          valid: false,
          errors: ['验证服务暂时不可用']
        });
      })
    );
  }
}