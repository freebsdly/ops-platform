import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { catchError, map, mergeMap, tap } from 'rxjs/operators';
import * as AuthActions from './auth.actions';
import * as PermissionActions from './permission.actions';
import { AuthService } from '../../../services/auth.service';
import { Router } from '@angular/router';
import { MODULES_CONFIG } from '../../../config/menu.config';
import { NzMessageService } from 'ng-zorro-antd/message';

@Injectable()
export class AuthEffects {
  private actions$ = inject(Actions);
  private authService = inject(AuthService);
  private router = inject(Router);
  private message = inject(NzMessageService);

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
          tap(() => {
            console.log('AuthEffects: 登出成功，导航到/login');
            this.message.success('登出成功');
            
            // 使用window.location.href强制页面重载，确保路由守卫能重新验证
            setTimeout(() => {
              console.log('AuthEffects: 使用window.location.href重定向到/login');
              window.location.href = '/login';
            }, 0);
          }),
          map(() => AuthActions.logoutSuccess()),
          catchError((error) => {
            console.error('AuthEffects: 登出失败:', error);
            
            let errorMessage = '登出成功，但网络请求失败';
            if (error.status === 0 || error.status === 500) {
              errorMessage = '登出成功，但服务器连接失败';
            } else if (error.message) {
              errorMessage = `登出成功，但发生错误: ${error.message}`;
            }
            
            this.message.warning(errorMessage);
            
            // 即使API失败也导航到login并触发logoutSuccess
            console.log('AuthEffects: API失败，但仍然导航到/login');
            
            // 使用window.location.href强制页面重载
            setTimeout(() => {
              console.log('AuthEffects: API失败，使用window.location.href重定向到/login');
              window.location.href = '/login';
            }, 0);
            
            return of(AuthActions.logoutSuccess());
          })
        )
      )
    )
  );

  logoutSuccess$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(AuthActions.logoutSuccess),
        tap(() => {
          console.log('AuthEffects: logoutSuccess action处理完成');
          // 导航已经在logout$ effect中处理了
        })
      ),
    { dispatch: false }
  );
}