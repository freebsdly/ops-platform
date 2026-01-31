import { createSelector } from '@ngrx/store';
import { AppState } from '../../types/app-state';
import { ConfigState } from './config.state';

export const selectConfigState = (state: AppState) => state.config;

export const selectConfig = createSelector(
  selectConfigState,
  (state: ConfigState) => state.config
);

export const selectLogoConfig = createSelector(
  selectConfig,
  (config) => config.logo
);

export const selectAppTitle = createSelector(
  selectConfig,
  (config) => config.appTitle
);

export const selectSidebarConfig = createSelector(
  selectConfig,
  (config) => config.sidebar
);

export const selectThemeConfig = createSelector(
  selectConfig,
  (config) => config.theme
);

export const selectHeaderConfig = createSelector(
  selectConfig,
  (config) => config.header
);

export const selectFooterConfig = createSelector(
  selectConfig,
  (config) => config.footer
);

export const selectConfigLoading = createSelector(
  selectConfigState,
  (state: ConfigState) => state.loading
);

export const selectConfigLoaded = createSelector(
  selectConfigState,
  (state: ConfigState) => state.loaded
);

export const selectConfigError = createSelector(
  selectConfigState,
  (state: ConfigState) => state.error
);

export const selectConfigLastUpdated = createSelector(
  selectConfigState,
  (state: ConfigState) => state.lastUpdated
);

export const selectLogoVisible = createSelector(
  selectLogoConfig,
  (logo) => logo.visible
);

export const selectLogoSrc = createSelector(
  selectLogoConfig,
  (logo) => logo.src
);

export const selectLogoAlt = createSelector(
  selectLogoConfig,
  (logo) => logo.alt
);

export const selectLogoLink = createSelector(
  selectLogoConfig,
  (logo) => logo.link
);

export const selectLogoWidth = createSelector(
  selectLogoConfig,
  (logo) => logo.width || '32px'
);

export const selectLogoHeight = createSelector(
  selectLogoConfig,
  (logo) => logo.height || '32px'
);

export const selectLogoCollapsedIcon = createSelector(
  selectLogoConfig,
  (logo) => logo.collapsedIcon || 'bars'
);

export const selectLogoExpandedIcon = createSelector(
  selectLogoConfig,
  (logo) => logo.expandedIcon || 'bars'
);