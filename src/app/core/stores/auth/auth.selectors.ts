import { createFeatureSelector, createSelector } from '@ngrx/store';
import { AuthState } from '../../types/app-state';
import { Permission } from '../../types/permission.interface';

export const selectAuthState = createFeatureSelector<AuthState>('auth');

export const selectUser = createSelector(
  selectAuthState,
  (state: AuthState) => state.user
);

export const selectToken = createSelector(
  selectAuthState,
  (state: AuthState) => state.token
);

export const selectIsAuthenticated = createSelector(
  selectAuthState,
  (state: AuthState) => state.isAuthenticated
);

export const selectIsLoading = createSelector(
  selectAuthState,
  (state: AuthState) => state.isLoading
);

export const selectAuthError = createSelector(
  selectAuthState,
  (state: AuthState) => state.error
);

// 新增权限相关选择器
export const selectPermissions = createSelector(
  selectAuthState,
  (state: AuthState) => state.permissions
);

export const selectUserRoles = createSelector(
  selectAuthState,
  (state: AuthState) => state.roles
);

export const selectHasPermission = (resource: string, action: string) => 
  createSelector(
    selectPermissions,
    (permissions: Permission[]) => 
      permissions.some(permission => 
        permission.resource === resource && 
        permission.action.includes(action)
      )
  );

export const selectHasRole = (roleId: string) => 
  createSelector(
    selectUserRoles,
    (roles: string[]) => roles.includes(roleId)
  );

export const selectHasAnyPermission = (permissionChecks: Array<{resource: string; action: string}>) => 
  createSelector(
    selectPermissions,
    (permissions: Permission[]) => 
      permissionChecks.some(({ resource, action }) => 
        permissions.some(permission => 
          permission.resource === resource && 
          permission.action.includes(action)
        )
      )
  );