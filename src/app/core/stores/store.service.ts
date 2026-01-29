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

@Injectable({ providedIn: 'root' })
export class StoreService {
  private store = inject(Store);

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
    this.store.dispatch(AuthActions.logout());
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
}