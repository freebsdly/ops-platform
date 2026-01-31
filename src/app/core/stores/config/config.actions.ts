import { createAction, props } from '@ngrx/store';
import { LayoutConfig, LogoConfig } from '../../types/layout-config.interface';

/**
 * 加载配置
 */
export const loadConfig = createAction('[Config] Load Config');
export const loadConfigSuccess = createAction(
  '[Config] Load Config Success',
  props<{ config: LayoutConfig }>()
);
export const loadConfigFailure = createAction(
  '[Config] Load Config Failure',
  props<{ error: string }>()
);

/**
 * 更新配置
 */
export const updateConfig = createAction(
  '[Config] Update Config',
  props<{ config: Partial<LayoutConfig> }>()
);
export const updateConfigSuccess = createAction(
  '[Config] Update Config Success',
  props<{ config: LayoutConfig }>()
);
export const updateConfigFailure = createAction(
  '[Config] Update Config Failure',
  props<{ error: string }>()
);

/**
 * 保存配置到后端
 */
export const saveConfig = createAction(
  '[Config] Save Config',
  props<{ config: LayoutConfig }>()
);
export const saveConfigSuccess = createAction(
  '[Config] Save Config Success',
  props<{ config: LayoutConfig }>()
);
export const saveConfigFailure = createAction(
  '[Config] Save Config Failure',
  props<{ error: string }>()
);

/**
 * 重置配置
 */
export const resetConfig = createAction('[Config] Reset Config');
export const resetConfigSuccess = createAction(
  '[Config] Reset Config Success',
  props<{ config: LayoutConfig }>()
);
export const resetConfigFailure = createAction(
  '[Config] Reset Config Failure',
  props<{ error: string }>()
);

/**
 * 更新Logo配置
 */
export const updateLogoConfig = createAction(
  '[Config] Update Logo Config',
  props<{ logoConfig: Partial<LogoConfig> }>()
);

/**
 * 更新应用标题
 */
export const updateAppTitle = createAction(
  '[Config] Update App Title',
  props<{ title: string }>()
);