import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { catchError, map, mergeMap, tap } from 'rxjs/operators';
import * as PermissionActions from './permission.actions';
import { PermissionService } from '../../../services/permission.service';
import { Store } from '@ngrx/store';
import { AppState } from '../../types/app-state';
import * as AuthSelectors from './auth.selectors';

@Injectable()
export class PermissionEffects {
  private actions$ = inject(Actions);
  private permissionService = inject(PermissionService);
  private store = inject(Store<AppState>);

  loadPermissions$ = createEffect(() =>
    this.actions$.pipe(
      ofType(PermissionActions.loadPermissions),
      mergeMap(() =>
        this.store.select(AuthSelectors.selectUser).pipe(
          mergeMap(user => {
            if (!user) {
              return of(PermissionActions.loadPermissionsSuccess({ permissions: [] }));
            }
            
            return this.permissionService.getUserPermissions(user.id).pipe(
              map(permissions => 
                PermissionActions.loadPermissionsSuccess({ permissions })
              ),
              catchError(error => 
                of(PermissionActions.loadPermissionsFailure({ error: error.message }))
              )
            );
          })
        )
      )
    )
  );

  loadPermissionsSuccess$ = createEffect(() =>
    this.actions$.pipe(
      ofType(PermissionActions.loadPermissionsSuccess),
      tap(({ permissions }) => {
        // 同步权限到PermissionService
        this.permissionService.setPermissions(permissions);
      })
    ),
    { dispatch: false }
  );

  updatePermissions$ = createEffect(() =>
    this.actions$.pipe(
      ofType(PermissionActions.updatePermissions),
      tap(({ permissions }) => {
        // 同步权限到PermissionService
        this.permissionService.setPermissions(permissions);
      })
    ),
    { dispatch: false }
  );
}