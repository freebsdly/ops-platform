import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';

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

registerLocaleData(zh);
registerLocaleData(en);

const ngZorroConfig: NzConfig = {
  // 注意组件名称没有 nz 前缀
};

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideHttpClient(),
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
  ],
};
