// src/app/services/module-menu.service.ts
// 智能的模块菜单服务，包含路由识别和状态管理功能

import { Injectable, inject } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { Observable, of } from 'rxjs';
import { filter, map, catchError } from 'rxjs/operators';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MODULES_CONFIG, MENUS_CONFIG, MenuItem, ModuleConfig } from '../config/menu.config';
import { UserApiService } from '../core/services/user-api.service';

export interface ModuleOption {
  id: string;
  title: string;
  icon: string;
  color: string;
  defaultPath: string;
  isActive: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class ModuleMenuService {
  private router = inject(Router);
  private userApiService = inject(UserApiService);

  getModules(): Observable<string[]> {
    return this.userApiService.getSystemModules().pipe(
      map(response => response.modules.map(module => module.id)),
      catchError(error => {
        console.error('获取系统模块失败:', error);
        // 回退到本地配置
        const modules = MODULES_CONFIG.map(module => module.id);
        return of(modules);
      })
    );
  }

  getModuleMenus(moduleId: string): Observable<MenuItem[]> {
    return this.userApiService.getModuleMenus(moduleId).pipe(
      map(response => {
        // 将API响应转换为MenuItem格式
        return response.menus.map(menu => ({
          key: menu.id,
          text: menu.title,
          icon: menu.icon,
          link: menu.path,
          children: menu.children?.map(child => ({
            key: child.id,
            text: child.title,
            icon: child.icon,
            link: child.path
          }))
        }));
      }),
      catchError(error => {
        console.error(`获取模块${moduleId}菜单失败:`, error);
        // 回退到本地配置
        const menus = MENUS_CONFIG[moduleId] || [];
        return of(menus);
      })
    );
  }

  switchModule(moduleId: string): void {
    const moduleConfig = MODULES_CONFIG.find(m => m.id === moduleId);
    if (moduleConfig && moduleConfig.defaultPath) {
      this.router.navigate([moduleConfig.defaultPath]);
    }
  }

  getCurrentModuleId(): Observable<string> {
    // 基于当前URL确定当前模块
    const currentUrl = this.router.url;
    const segments = currentUrl.split('/').filter(segment => segment.length > 0);

    if (segments.length === 0) {
      return of('dashboard'); // 默认仪表板
    }

    // 从URL的第一个段获取模块ID
    const moduleId = segments[0];
    const moduleConfig = MODULES_CONFIG.find(m => m.id === moduleId);

    if (moduleConfig) {
      return of(moduleId);
    }

    return of('dashboard'); // 回退到仪表板
  }

  getCurrentModule(): Observable<ModuleConfig | null> {
    const currentUrl = this.router.url;
    const segments = currentUrl.split('/').filter(segment => segment.length > 0);

    if (segments.length === 0) {
      return of(null);
    }

    const moduleId = segments[0];
    const moduleConfig = MODULES_CONFIG.find(m => m.id === moduleId);

    return of(moduleConfig || null);
  }

  // 监听模块变化
  listenToModuleChanges(): Observable<string> {
    return this.router.events.pipe(
      filter(event => event instanceof NavigationEnd),
      map(event => {
        const url = (event as NavigationEnd).url;
        const segments = url.split('/').filter(segment => segment.length > 0);
        return segments[0] || 'dashboard';
      }),
      takeUntilDestroyed()
    );
  }

  getAvailableModules(): Observable<ModuleOption[]> {
    const currentModuleId = this.router.url.split('/').filter(segment => segment.length > 0)[0];

    const modules = MODULES_CONFIG.map(module => ({
      id: module.id,
      title: module.title,
      icon: module.icon,
      color: module.color,
      defaultPath: module.defaultPath,
      isActive: module.id === currentModuleId,
    }));
    return of(modules);
  }
}