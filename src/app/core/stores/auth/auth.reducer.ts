import { createReducer, on } from '@ngrx/store';
import { AuthState } from '../../types/app-state';
import * as AuthActions from './auth.actions';

export const initialState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
};

export const authReducer = createReducer(
  initialState,
  // Login
  on(AuthActions.login, (state) => ({
    ...state,
    isLoading: true,
    error: null,
  })),
  on(AuthActions.loginSuccess, (state, { user, token }) => ({
    ...state,
    user,
    token,
    isAuthenticated: true,
    isLoading: false,
    error: null,
  })),
  on(AuthActions.loginFailure, (state, { error }) => ({
    ...state,
    isLoading: false,
    error,
  })),
  // Logout
  on(AuthActions.logout, (state) => ({
    ...state,
    isLoading: true,
  })),
  on(AuthActions.logoutSuccess, () => initialState),
  on(AuthActions.logoutFailure, (state, { error }) => ({
    ...state,
    isLoading: false,
    error,
  })),
  // Check Auth
  on(AuthActions.checkAuth, (state) => ({
    ...state,
    isLoading: true,
  })),
  on(AuthActions.checkAuthSuccess, (state, { user, token }) => ({
    ...state,
    user,
    token,
    isAuthenticated: !!user && !!token,
    isLoading: false,
    error: null,
  })),
  // Clear Error
  on(AuthActions.clearAuthError, (state) => ({
    ...state,
    error: null,
  }))
);