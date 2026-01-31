import { createAction, props } from '@ngrx/store';
import { Permission } from '../../types/permission.interface';

// 加载权限
export const loadPermissions = createAction('[Permission] Load Permissions');

export const loadPermissionsSuccess = createAction(
  '[Permission] Load Permissions Success',
  props<{ permissions: Permission[] }>()
);

export const loadPermissionsFailure = createAction(
  '[Permission] Load Permissions Failure',
  props<{ error: string }>()
);

// 更新权限
export const updatePermissions = createAction(
  '[Permission] Update Permissions',
  props<{ permissions: Permission[] }>()
);

// 清除权限
export const clearPermissions = createAction('[Permission] Clear Permissions');

// 检查权限
export const checkPermission = createAction(
  '[Permission] Check Permission',
  props<{ resource: string; action: string }>()
);