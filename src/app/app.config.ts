import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';

import { routes } from './app.routes';
import { icons } from './icons-provider';
import { provideNzIcons } from 'ng-zorro-antd/icon';
import { zh_CN, en_US, provideNzI18n, NZ_I18N } from 'ng-zorro-antd/i18n';
import { registerLocaleData } from '@angular/common';
import zh from '@angular/common/locales/zh';
import en from '@angular/common/locales/en';
import { NzConfig, provideNzConfig } from 'ng-zorro-antd/core/config';
import { provideTranslateService } from '@ngx-translate/core';
import { provideTranslateHttpLoader } from '@ngx-translate/http-loader';
import { provideStore } from '@ngrx/store';
import { provideEffects } from '@ngrx/effects';
import { provideRouterStore } from '@ngrx/router-store';
import { provideStoreDevtools } from '@ngrx/store-devtools';
import { httpCancelInterceptor } from './core/interceptors/http-cancel.interceptor';

registerLocaleData(zh);
registerLocaleData(en);

const ngZorroConfig: NzConfig = {
  // 注意组件名称没有 nz 前缀
};

import { rootReducer } from './core/stores/root.reducer';
import { AuthEffects } from './core/stores/auth/auth.effects';
import { LayoutEffects } from './core/stores/layout/layout.effects';
import { ModuleEffects } from './core/stores/module/module.effects';
import { ConfigEffects } from './core/stores/config/config.effects';
import { PermissionEffects } from './core/stores/auth/permission.effects';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideHttpClient(withInterceptors([httpCancelInterceptor])),
    provideNzIcons(icons),
    provideNzI18n(zh_CN),
    provideNzConfig(ngZorroConfig),
    { provide: NZ_I18N, useValue: zh_CN },
    provideTranslateService({
      loader: provideTranslateHttpLoader({
        prefix: '/assets/i18n/',
        suffix: '.json',
      }),
      fallbackLang: 'zh',
      lang: 'zh',
    }),
    // NgRx Store Configuration
    provideStore(rootReducer),
    provideEffects(AuthEffects, LayoutEffects, ModuleEffects, ConfigEffects, PermissionEffects),
    provideRouterStore(),
    provideStoreDevtools({
      maxAge: 25,
      logOnly: false,
      autoPause: true,
    }),
  ],
};
