// src/app/services/module-menu.service.ts
// 智能的模块菜单服务，包含路由识别和状态管理功能

import { Injectable, inject } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MODULES_CONFIG, MENUS_CONFIG, MenuItem, ModuleConfig } from '../config/menu.config';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';

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

  getModules(): Observable<string[]> {
    // Return module IDs from MODULES_CONFIG
    const modules = MODULES_CONFIG.map(module => module.id);
    return of(modules).pipe(delay(100));
  }

  getModuleMenus(moduleId: string): Observable<MenuItem[]> {
    const menus = MENUS_CONFIG[moduleId] || [];
    return of(menus).pipe(delay(100));
  }

  switchModule(moduleId: string): void {
    const moduleConfig = MODULES_CONFIG.find(m => m.id === moduleId);
    if (moduleConfig && moduleConfig.defaultPath) {
      this.router.navigate([moduleConfig.defaultPath]);
    }
  }

  getCurrentModuleId(): Observable<string> {
    // This is a simplified implementation
    // In a real app, you would track current module based on URL
    return of('dashboard').pipe(delay(50));
  }

  getAvailableModules(): Observable<ModuleOption[]> {
    const modules = MODULES_CONFIG.map(module => ({
      id: module.id,
      title: module.title,
      icon: module.icon,
      color: module.color,
      defaultPath: module.defaultPath,
      isActive: module.id === 'dashboard', // Simplified
    }));
    return of(modules).pipe(delay(100));
  }
}