import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { catchError, map, mergeMap, tap } from 'rxjs/operators';
import { ConfigService } from '../../services/config.service';
import * as ConfigActions from './config.actions';
import { NzMessageService } from 'ng-zorro-antd/message';

@Injectable()
export class ConfigEffects {
  private actions$ = inject(Actions);
  private configService = inject(ConfigService);
  private message = inject(NzMessageService);

  /**
   * 加载配置效果
   */
  loadConfig$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ConfigActions.loadConfig),
      mergeMap(() =>
        this.configService.loadLayoutConfig().pipe(
          map((config) => ConfigActions.loadConfigSuccess({ config })),
          catchError((error) =>
            of(ConfigActions.loadConfigFailure({ error: error.message }))
          )
        )
      )
    )
  );

  /**
   * 保存配置效果
   */
  saveConfig$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ConfigActions.saveConfig),
      mergeMap(({ config }) =>
        this.configService.saveLayoutConfig(config).pipe(
          map((savedConfig) => ConfigActions.saveConfigSuccess({ config: savedConfig })),
          catchError((error) =>
            of(ConfigActions.saveConfigFailure({ error: error.message }))
          )
        )
      )
    )
  );

  /**
   * 重置配置效果 - 从API重新加载配置
   */
  resetConfig$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ConfigActions.resetConfig),
      mergeMap(() =>
        this.configService.loadLayoutConfig(true).pipe(
          map((config) => ConfigActions.resetConfigSuccess({ config })),
          catchError((error) =>
            of(ConfigActions.resetConfigFailure({ error: error.message }))
          )
        )
      )
    )
  );



  /**
   * 更新应用标题效果
   */
  updateAppTitle$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ConfigActions.updateAppTitle),
      map(({ title }) =>
        ConfigActions.updateConfig({ config: { appTitle: title } })
      )
    )
  );

  /**
   * 配置加载成功后更新本地存储
   */
  cacheConfigOnSuccess$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(
          ConfigActions.loadConfigSuccess,
          ConfigActions.updateConfigSuccess,
          ConfigActions.saveConfigSuccess,
          ConfigActions.resetConfigSuccess
        ),
        tap(({ config }) => {
          try {
            localStorage.setItem('app_layout_config', JSON.stringify(config));
            localStorage.setItem('app_layout_config_timestamp', Date.now().toString());
          } catch (error) {
            console.warn('Failed to cache config:', error);
          }
        })
      ),
    { dispatch: false }
  );

  /**
   * 配置失败后提供用户反馈（可选）
   */
  handleConfigError$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(
          ConfigActions.loadConfigFailure,
          ConfigActions.updateConfigFailure,
          ConfigActions.saveConfigFailure,
          ConfigActions.resetConfigFailure
        ),
        tap(({ error }) => {
          console.error('Configuration error:', error);
          // 显示错误alert通知
          this.message.error(`配置错误: ${error}`);
        })
      ),
    { dispatch: false }
  );
}