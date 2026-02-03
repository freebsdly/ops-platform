import { Injectable, inject } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { User } from '../types/user.interface';
import * as AuthActions from './auth/auth.actions';
import * as AuthSelectors from './auth/auth.selectors';
import * as LayoutActions from './layout/layout.actions';
import * as LayoutSelectors from './layout/layout.selectors';
import * as ModuleActions from './module/module.actions';
import * as ModuleSelectors from './module/module.selectors';
import * as ConfigActions from './config/config.actions';
import * as ConfigSelectors from './config/config.selectors';
import { Router } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class StoreService {
  private store = inject(Store);
  private router = inject(Router);

  // Auth Selectors
  get user$(): Observable<User | null> {
    return this.store.select(AuthSelectors.selectUser);
  }

  get token$(): Observable<string | null> {
    return this.store.select(AuthSelectors.selectToken);
  }

  get isAuthenticated$(): Observable<boolean> {
    return this.store.select(AuthSelectors.selectIsAuthenticated);
  }

  get isLoading$(): Observable<boolean> {
    return this.store.select(AuthSelectors.selectIsLoading);
  }

  get authError$(): Observable<string | null> {
    return this.store.select(AuthSelectors.selectAuthError);
  }

  // Layout Selectors
  get isSiderCollapsed$(): Observable<boolean> {
    return this.store.select(LayoutSelectors.selectIsSiderCollapsed);
  }

  get currentModule$(): Observable<string | null> {
    return this.store.select(LayoutSelectors.selectCurrentModule);
  }

  get theme$(): Observable<'light' | 'dark'> {
    return this.store.select(LayoutSelectors.selectTheme);
  }

  // Module Selectors
  get modules$(): Observable<string[]> {
    return this.store.select(ModuleSelectors.selectModules);
  }

  // Auth Actions
  login(username: string, password: string): void {
    this.store.dispatch(AuthActions.login({ username, password }));
  }

  logout(): void {
    console.log('StoreService.logout() called');
    
    // 清除本地存储的认证信息
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
    
    // Dispatch logout action
    this.store.dispatch(AuthActions.logout());
    
    // 导航到登录页面
    console.log('Navigating to /login');
    this.router.navigate(['/login']);
  }

  checkAuth(): void {
    this.store.dispatch(AuthActions.checkAuth());
  }

  clearAuthError(): void {
    this.store.dispatch(AuthActions.clearAuthError());
  }

  // Layout Actions
  toggleSider(): void {
    this.store.dispatch(LayoutActions.toggleSider());
  }

  collapseSider(): void {
    this.store.dispatch(LayoutActions.collapseSider());
  }

  expandSider(): void {
    this.store.dispatch(LayoutActions.expandSider());
  }

  setSiderCollapsed(collapsed: boolean): void {
    this.store.dispatch(LayoutActions.setSiderCollapsed({ collapsed }));
  }

  setCurrentModule(module: string): void {
    this.store.dispatch(LayoutActions.setCurrentModule({ module }));
  }

  toggleTheme(): void {
    this.store.dispatch(LayoutActions.toggleTheme());
  }

  setTheme(theme: 'light' | 'dark'): void {
    this.store.dispatch(LayoutActions.setTheme({ theme }));
  }

  // Module Actions
  loadModules(): void {
    this.store.dispatch(ModuleActions.loadModules());
  }

  selectModule(module: string): void {
    this.store.dispatch(ModuleActions.selectModule({ module }));
  }

  // Config Selectors
  get layoutConfig$(): Observable<any> {
    return this.store.select(ConfigSelectors.selectConfig);
  }

  get logoConfig$(): Observable<any> {
    return this.store.select(ConfigSelectors.selectLogoConfig);
  }

  get appTitle$(): Observable<string> {
    return this.store.select(ConfigSelectors.selectAppTitle);
  }

  get logoSrc$(): Observable<string> {
    return this.store.select(ConfigSelectors.selectLogoSrc);
  }

  get logoAlt$(): Observable<string> {
    return this.store.select(ConfigSelectors.selectLogoAlt);
  }

  get logoLink$(): Observable<string | undefined> {
    return this.store.select(ConfigSelectors.selectLogoLink);
  }

  get configLoading$(): Observable<boolean> {
    return this.store.select(ConfigSelectors.selectConfigLoading);
  }

  get configLoaded$(): Observable<boolean> {
    return this.store.select(ConfigSelectors.selectConfigLoaded);
  }

  get logoCollapsedIcon$(): Observable<string> {
    return this.store.select(ConfigSelectors.selectLogoCollapsedIcon);
  }

  get logoExpandedIcon$(): Observable<string> {
    return this.store.select(ConfigSelectors.selectLogoExpandedIcon);
  }

  // Config Actions
  loadConfig(): void {
    this.store.dispatch(ConfigActions.loadConfig());
  }

  updateConfig(config: Partial<any>): void {
    this.store.dispatch(ConfigActions.updateConfig({ config }));
  }

  saveConfig(config: any): void {
    this.store.dispatch(ConfigActions.saveConfig({ config }));
  }

  resetConfig(): void {
    this.store.dispatch(ConfigActions.resetConfig());
  }

  updateLogoConfig(logoConfig: Partial<any>): void {
    this.store.dispatch(ConfigActions.updateLogoConfig({ logoConfig }));
  }

  updateAppTitle(title: string): void {
    this.store.dispatch(ConfigActions.updateAppTitle({ title }));
  }
}