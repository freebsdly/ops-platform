import { createReducer, on } from '@ngrx/store';
import { LayoutState } from '../../types/app-state';
import * as LayoutActions from './layout.actions';

export const initialState: LayoutState = {
  isCollapsed: false,
  currentModule: null,
  theme: 'light',
};

export const layoutReducer = createReducer(
  initialState,
  // Sider Actions
  on(LayoutActions.toggleSider, (state) => ({
    ...state,
    isCollapsed: !state.isCollapsed,
  })),
  on(LayoutActions.collapseSider, (state) => ({
    ...state,
    isCollapsed: true,
  })),
  on(LayoutActions.expandSider, (state) => ({
    ...state,
    isCollapsed: false,
  })),
  on(LayoutActions.setSiderCollapsed, (state, { collapsed }) => ({
    ...state,
    isCollapsed: collapsed,
  })),
  // Module Actions
  on(LayoutActions.setCurrentModule, (state, { module }) => ({
    ...state,
    currentModule: module,
  })),
  // Theme Actions
  on(LayoutActions.toggleTheme, (state) => ({
    ...state,
    theme: state.theme === 'light' ? 'dark' : 'light',
  })),
  on(LayoutActions.setTheme, (state, { theme }) => ({
    ...state,
    theme,
  }))
);