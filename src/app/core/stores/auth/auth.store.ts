import { Injectable, inject, signal, computed, InjectionToken } from '@angular/core';
import { Store } from '@ngrx/store';
import { User } from '../../types/user.interface';
import { Permission } from '../../types/permission.interface';
import * as AuthSelectors from './auth.selectors';

export const AUTH_STORE = new InjectionToken<AuthStore>('AUTH_STORE');

/**
 * Signal-based Auth Store
 * Wraps NgRx selectors with Angular Signals for better reactivity
 */
@Injectable({ providedIn: 'root' })
export class AuthStore {
  private store = inject(Store);

  // Private writable signals - synced with NgRx state
  private readonly user = signal<User | null>(null);
  private readonly token = signal<string | null>(null);
  private readonly isLoading = signal(false);
  private readonly error = signal<string | null>(null);
  private readonly isAuthenticated = signal(false);
  private readonly permissions = signal<Permission[]>([]);
  private readonly roles = signal<string[]>([]);

  // Read-only computed signals for public access
  readonly userSignal = this.user.asReadonly();
  readonly tokenSignal = this.token.asReadonly();
  readonly isLoadingSignal = this.isLoading.asReadonly();
  readonly errorSignal = this.error.asReadonly();
  readonly isAuthenticatedSignal = this.isAuthenticated.asReadonly();
  readonly permissionsSignal = this.permissions.asReadonly();

  // Computed signals for derived state
  readonly hasUser = computed(() => !!this.user());
  readonly hasToken = computed(() => !!this.token());
  readonly userName = computed(() => this.user()?.name ?? '');
  readonly userEmail = computed(() => this.user()?.email ?? '');

  constructor() {
    // Sync signals with NgRx state
    this.syncWithNgRx();
  }

  /**
   * Sync signals with NgRx store state
   */
  private syncWithNgRx(): void {
    this.store.select(AuthSelectors.selectUser).subscribe((user) => {
      this.user.set(user);
    });

    this.store.select(AuthSelectors.selectToken).subscribe((token) => {
      this.token.set(token);
    });

    this.store.select(AuthSelectors.selectIsLoading).subscribe((loading) => {
      this.isLoading.set(loading);
    });

    this.store.select(AuthSelectors.selectAuthError).subscribe((error) => {
      this.error.set(error);
    });

    this.store.select(AuthSelectors.selectIsAuthenticated).subscribe((auth) => {
      this.isAuthenticated.set(auth);
    });

    this.store.select(AuthSelectors.selectPermissions).subscribe((perms) => {
      this.permissions.set(perms || []);
    });

    this.store.select(AuthSelectors.selectUserRoles).subscribe((r) => {
      this.roles.set(r);
    });
  }

  /**
   * Check if user has specific permission
   */
  hasPermission(resource: string, action: string): boolean {
    const perms = this.permissions();
    return perms.some((p: Permission) => p.resource === resource && p.action.includes(action));
  }

  /**
   * Check if user has specific role
   */
  hasRole(roleId: string): boolean {
    return this.roles().includes(roleId);
  }
}
