// src/app/services/module-menu.service.ts
// 智能的模块菜单服务，包含路由识别和状态管理功能

import { Injectable, inject, signal, computed } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MODULES_CONFIG, MENUS_CONFIG, MenuItem, ModuleConfig } from '../config/menu.config';

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

  // 信号状态管理
  private currentUrl = signal<string>(this.router.url);
  private currentModuleId = signal<string>('dashboard');

  // 计算属性 - 当前活动模块
  readonly currentModule = computed((): ModuleConfig => {
    return MODULES_CONFIG.find(module => module.id === this.currentModuleId()) || MODULES_CONFIG[0];
  });

  // 计算属性 - 可用模块列表
  readonly availableModules = computed((): ModuleOption[] => {
    const activeId = this.currentModuleId();
    return MODULES_CONFIG.map(module => ({
      id: module.id,
      title: module.title,
      icon: module.icon,
      color: module.color,
      defaultPath: module.defaultPath,
      isActive: module.id === activeId,
    }));
  });

  // 计算属性 - 当前模块的菜单项
  readonly currentModuleMenus = computed((): MenuItem[] => {
    return MENUS_CONFIG[this.currentModuleId()] || [];
  });

  constructor() {
    // 监听路由变化
    this.router.events
      .pipe(
        filter((event): event is NavigationEnd => event instanceof NavigationEnd),
        takeUntilDestroyed()
      )
      .subscribe((event: NavigationEnd) => {
        const url = event.urlAfterRedirects;
        this.currentUrl.set(url);
        this.identifyModuleFromUrl(url);
      });

    // 初始识别模块
    this.identifyModuleFromUrl(this.currentUrl());
  }

  // 智能识别模块 - 基于URL路径前缀匹配
  private identifyModuleFromUrl(url: string): void {
    const cleanUrl = this.cleanUrl(url);
    
    // 尝试找到与当前URL最匹配的模块
    let bestMatch: { moduleId: string; matchLength: number } | null = null;
    
    for (const module of MODULES_CONFIG) {
      const matchLength = this.calculateMatchLength(cleanUrl, module.defaultPath);
      if (matchLength > 0) {
        if (!bestMatch || matchLength > bestMatch.matchLength) {
          bestMatch = { moduleId: module.id, matchLength };
        }
      }
    }
    
    // 设置当前模块
    if (bestMatch) {
      this.switchModule(bestMatch.moduleId);
    } else {
      // 如果没有匹配，使用默认模块
      this.switchModule('dashboard');
    }
  }

  // 计算URL与模块路径的匹配程度
  private calculateMatchLength(url: string, modulePath: string): number {
    if (url === modulePath) {
      return modulePath.length; // 完全匹配
    }
    
    if (url.startsWith(modulePath + '/')) {
      return modulePath.length; // 路径前缀匹配
    }
    
    // 简化处理：检查路径段匹配
    const urlSegments = url.split('/').filter(segment => segment.length > 0);
    const moduleSegments = modulePath.split('/').filter(segment => segment.length > 0);
    
    let matchLength = 0;
    for (let i = 0; i < Math.min(urlSegments.length, moduleSegments.length); i++) {
      if (urlSegments[i] === moduleSegments[i]) {
        matchLength++;
      } else {
        break;
      }
    }
    
    return matchLength;
  }

  // 清理URL，移除查询参数和哈希
  private cleanUrl(url: string): string {
    return url.split('?')[0].split('#')[0];
  }

  // 切换模块（手动触发）
  switchModule(moduleId: string): void {
    if (moduleId !== this.currentModuleId()) {
      this.currentModuleId.set(moduleId);
      
      // 导航到模块的默认路径
      const moduleConfig = MODULES_CONFIG.find(m => m.id === moduleId);
      if (moduleConfig && moduleConfig.defaultPath) {
        const currentPath = this.cleanUrl(this.currentUrl());
        if (!currentPath.startsWith(moduleConfig.defaultPath)) {
          // 只在当前路径不属于该模块时导航
          this.router.navigate([moduleConfig.defaultPath]);
        }
      }
    }
  }

  // 获取指定模块的菜单（用于按需加载）
  getModuleMenus(moduleId: string): MenuItem[] {
    return MENUS_CONFIG[moduleId] || [];
  }

  // 获取当前URL（用于调试）
  getCurrentUrl(): string {
    return this.currentUrl();
  }
}