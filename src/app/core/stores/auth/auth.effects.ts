import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { catchError, map, mergeMap, tap } from 'rxjs/operators';
import * as AuthActions from './auth.actions';
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
          catchError((error) =>
            of(AuthActions.loginFailure({ error: error.message }))
          )
        )
      )
    )
  );

  loginSuccess$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(AuthActions.loginSuccess),
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
          this.router.navigate(['/login']);
        })
      ),
    { dispatch: false }
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
}