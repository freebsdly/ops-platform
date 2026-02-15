import { createReducer, on } from '@ngrx/store';
import { ConfigState, initialState } from './config.state';
import * as ConfigActions from './config.actions';

export const configReducer = createReducer(
  initialState,
  
  // 加载配置
  on(ConfigActions.loadConfig, (state) => ({
    ...state,
    loading: true,
    error: null
  })),
  
  on(ConfigActions.loadConfigSuccess, (state, { config }) => ({
    ...state,
    config,
    loading: false,
    loaded: true,
    error: null,
    lastUpdated: Date.now()
  })),
  
  on(ConfigActions.loadConfigFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
    lastUpdated: null
  })),
  
  // 更新配置
  on(ConfigActions.updateConfig, (state, { config }) => {
    if (!state.config) {
      // 如果当前配置为null，使用传入的配置作为初始配置
      return {
        ...state,
        config: config as any,
        loaded: true,
        lastUpdated: Date.now()
      };
    }
    return {
      ...state,
      config: { ...state.config, ...config },
      lastUpdated: Date.now()
    };
  }),
  
  on(ConfigActions.updateConfigSuccess, (state, { config }) => ({
    ...state,
    config,
    lastUpdated: Date.now()
  })),
  
  on(ConfigActions.updateConfigFailure, (state, { error }) => ({
    ...state,
    error
  })),
  
  // 保存配置
  on(ConfigActions.saveConfig, (state) => ({
    ...state,
    loading: true,
    error: null
  })),
  
  on(ConfigActions.saveConfigSuccess, (state, { config }) => ({
    ...state,
    config,
    loading: false,
    error: null,
    lastUpdated: Date.now()
  })),
  
  on(ConfigActions.saveConfigFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),
  
  // 重置配置
  on(ConfigActions.resetConfig, (state) => ({
    ...state,
    loading: true,
    error: null
  })),
  
  on(ConfigActions.resetConfigSuccess, (state, { config }) => ({
    ...state,
    config,
    loading: false,
    loaded: true,
    error: null,
    lastUpdated: Date.now()
  })),
  
  on(ConfigActions.resetConfigFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),
  
  // 特定配置更新
  on(ConfigActions.updateLogoConfig, (state, { logoConfig }) => {
    if (!state.config) {
      return state;
    }
    return {
      ...state,
      config: {
        ...state.config,
        logo: { ...state.config.logo, ...logoConfig }
      },
      lastUpdated: Date.now()
    };
  }),
  
  on(ConfigActions.updateAppTitle, (state, { title }) => {
    if (!state.config) {
      return state;
    }
    return {
      ...state,
      config: {
        ...state.config,
        appTitle: title
      },
      lastUpdated: Date.now()
    };
  })
);