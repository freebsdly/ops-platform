import { User } from '../types/user.interface';
import { Permission } from '../types/permission.interface';

import { ConfigState } from '../stores/config/config.state';

export interface AppState {
  auth: AuthState;
  layout: LayoutState;
  modules: ModuleState;
  config: ConfigState;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  // 新增权限相关状态
  permissions: Permission[];
  roles: string[];
}

export interface LayoutState {
  isCollapsed: boolean;
  currentModule: string | null;
  theme: 'light' | 'dark';
}

export interface ModuleState {
  currentModule: string | null;
  modules: string[];
  isLoading: boolean;
}