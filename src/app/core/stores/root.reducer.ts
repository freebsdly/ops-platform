import { ActionReducerMap } from '@ngrx/store';
import { AppState } from '../types/app-state';
import { authReducer } from './auth/auth.reducer';
import { layoutReducer } from './layout/layout.reducer';
import { moduleReducer } from './module/module.reducer';

export const rootReducer: ActionReducerMap<AppState> = {
  auth: authReducer,
  layout: layoutReducer,
  modules: moduleReducer,
};