import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { catchError, map, mergeMap, tap } from 'rxjs/operators';
import * as AuthActions from './auth.actions';
import * as PermissionActions from './permission.actions';
import { AuthService } from '../../../services/auth.service';
import { Router } from '@angular/router';
import { MODULES_CONFIG } from '../../../config/menu.config';

@Injectable()
export class AuthEffects {
  private actions$ = inject(Actions);
  private authService = inject(AuthService);
  private router = inject(Router);

  login$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.login),
      mergeMap(({ username, password }) =>
        this.authService.login(username, password).pipe(
          map((response) =>
            AuthActions.loginSuccess({
              user: response.user,
              token: response.token,
            })
          ),
          catchError((error) =>{
            // 提供更友好的错误消息
            let errorMessage = '登录失败，请检查用户名和密码';
            
            if (error.status === 401) {
              errorMessage = '用户名或密码错误';
            } else if (error.status === 0 || error.status === 500) {
              errorMessage = '服务器错误，请稍后重试';
            } else if (error.error?.error) {
              // 使用服务器返回的错误消息
              errorMessage = error.error.error;
            } else if (error.message) {
              errorMessage = error.message;
            }
            
            return of(AuthActions.loginFailure({ error: errorMessage }));
          })
        )
      )
    )
  );

  loginSuccess$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.loginSuccess),
      map(() => PermissionActions.loadPermissions())
    )
  );

  checkAuth$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.checkAuth),
      mergeMap(() =>
        this.authService.checkAuth().pipe(
          map((response) =>
            AuthActions.checkAuthSuccess({
              user: response.user,
              token: response.token,
            })
          ),
          catchError(() => of(AuthActions.checkAuthSuccess({ user: null, token: null })))
        )
      )
    )
  );

  checkAuthSuccess$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.checkAuthSuccess),
      mergeMap(({ user }) => {
        if (user) {
          return of(PermissionActions.loadPermissions());
        }
        return of();
      })
    )
  );

  permissionsLoaded$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(PermissionActions.loadPermissionsSuccess),
        tap(() => {
          // 登录成功后重定向到第一个模块的默认路径
          if (MODULES_CONFIG.length > 0) {
            this.router.navigate([MODULES_CONFIG[0].defaultPath]);
          } else {
            // 如果没有配置模块，重定向到根路径
            this.router.navigate(['/']);
          }
        })
      ),
    { dispatch: false }
  );

  logout$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.logout),
      mergeMap(() =>
        this.authService.logout().pipe(
          map(() => AuthActions.logoutSuccess()),
          catchError((error) =>
            of(AuthActions.logoutFailure({ error: error.message }))
          )
        )
      )
    )
  );

  logoutSuccess$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(AuthActions.logoutSuccess),
        tap(() => {
          // 导航到登录页面 - 现在在AuthService中处理
          // this.router.navigate(['/login']);
        })
      ),
    { dispatch: false }
  );
}