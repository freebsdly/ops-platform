import { createFeatureSelector, createSelector } from '@ngrx/store';
import { LayoutState } from '../../types/app-state';

export const selectLayoutState = createFeatureSelector<LayoutState>('layout');

export const selectIsSiderCollapsed = createSelector(
  selectLayoutState,
  (state: LayoutState) => state.isCollapsed
);

export const selectCurrentModule = createSelector(
  selectLayoutState,
  (state: LayoutState) => state.currentModule
);

export const selectTheme = createSelector(
  selectLayoutState,
  (state: LayoutState) => state.theme
);