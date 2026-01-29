import { createAction, props } from '@ngrx/store';
import { User } from '../../types/user.interface';

// Login Actions
export const login = createAction(
  '[Auth] Login',
  props<{ username: string; password: string }>()
);

export const loginSuccess = createAction(
  '[Auth] Login Success',
  props<{ user: User; token: string }>()
);

export const loginFailure = createAction(
  '[Auth] Login Failure',
  props<{ error: string }>()
);

// Logout Actions
export const logout = createAction('[Auth] Logout');
export const logoutSuccess = createAction('[Auth] Logout Success');
export const logoutFailure = createAction(
  '[Auth] Logout Failure',
  props<{ error: string }>()
);

// Check Auth Actions
export const checkAuth = createAction('[Auth] Check Auth');
export const checkAuthSuccess = createAction(
  '[Auth] Check Auth Success',
  props<{ user: User | null; token: string | null }>()
);

export const clearAuthError = createAction('[Auth] Clear Error');