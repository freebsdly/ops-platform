import { createAction, props } from '@ngrx/store';

// Load Modules
export const loadModules = createAction('[Module] Load Modules');
export const loadModulesSuccess = createAction(
  '[Module] Load Modules Success',
  props<{ modules: string[] }>()
);
export const loadModulesFailure = createAction(
  '[Module] Load Modules Failure',
  props<{ error: string }>()
);

// Select Module
export const selectModule = createAction(
  '[Module] Select Module',
  props<{ module: string }>()
);