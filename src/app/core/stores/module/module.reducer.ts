import { createReducer, on } from '@ngrx/store';
import { ModuleState } from '../../types/app-state';
import * as ModuleActions from './module.actions';

export const initialState: ModuleState = {
  currentModule: null,
  modules: [],
  isLoading: false,
};

export const moduleReducer = createReducer(
  initialState,
  // Load Modules
  on(ModuleActions.loadModules, (state) => ({
    ...state,
    isLoading: true,
  })),
  on(ModuleActions.loadModulesSuccess, (state, { modules }) => ({
    ...state,
    modules,
    isLoading: false,
  })),
  on(ModuleActions.loadModulesFailure, (state) => ({
    ...state,
    isLoading: false,
  })),
  // Select Module
  on(ModuleActions.selectModule, (state, { module }) => ({
    ...state,
    currentModule: module,
  }))
);