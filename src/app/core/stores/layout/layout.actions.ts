import { createAction, props } from '@ngrx/store';

// Sider Actions
export const toggleSider = createAction('[Layout] Toggle Sider');
export const collapseSider = createAction('[Layout] Collapse Sider');
export const expandSider = createAction('[Layout] Expand Sider');
export const setSiderCollapsed = createAction(
  '[Layout] Set Sider Collapsed',
  props<{ collapsed: boolean }>()
);

// Module Actions
export const setCurrentModule = createAction(
  '[Layout] Set Current Module',
  props<{ module: string }>()
);

// Theme Actions
export const toggleTheme = createAction('[Layout] Toggle Theme');
export const setTheme = createAction(
  '[Layout] Set Theme',
  props<{ theme: 'light' | 'dark' }>()
);