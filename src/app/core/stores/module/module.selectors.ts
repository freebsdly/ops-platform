import { createFeatureSelector, createSelector } from '@ngrx/store';
import { ModuleState } from '../../types/app-state';

export const selectModuleState = createFeatureSelector<ModuleState>('modules');

export const selectModules = createSelector(
  selectModuleState,
  (state: ModuleState) => state.modules
);

export const selectCurrentModuleFromState = createSelector(
  selectModuleState,
  (state: ModuleState) => state.currentModule
);

export const selectIsModulesLoading = createSelector(
  selectModuleState,
  (state: ModuleState) => state.isLoading
);