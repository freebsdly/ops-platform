import { Component, inject, AfterViewInit, ChangeDetectionStrategy } from '@angular/core';
import { NzDropdownModule } from 'ng-zorro-antd/dropdown';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzMenuModule } from 'ng-zorro-antd/menu';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { NzI18nService, zh_CN, en_US, NzI18nInterface } from 'ng-zorro-antd/i18n';
import { StorageService, StorageType } from '../../core/services/storage.service';

@Component({
  selector: 'app-lang-selector',
  imports: [NzDropdownModule, NzIconModule, NzMenuModule, TranslateModule],
  templateUrl: './lang-selector.html',
  styleUrl: './lang-selector.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LangSelector implements AfterViewInit {
  private translate = inject(TranslateService);
  private i18n = inject(NzI18nService);
  private storageService = inject(StorageService);

  currentLanguage = 'zh';

  languages = [
    { key: 'zh', label: 'LANGUAGE.ZH', icon: '🇨🇳', locale: zh_CN },
    { key: 'en', label: 'LANGUAGE.EN', icon: '🇺🇸', locale: en_US },
  ];

  ngAfterViewInit() {
    const savedLang = this.storageService.getItem<string>('preferredLanguage', {
      type: StorageType.LOCAL
    });
    if (savedLang) {
      this.changeLanguage(savedLang, false);
    }
  }

  changeLanguage(lang: string, reload: boolean = true): void {
    const language = this.languages.find(l => l.key === lang);
    if (!language) return;

    this.currentLanguage = lang;
    this.translate.use(lang);
    this.i18n.setLocale(language.locale as NzI18nInterface);
    this.storageService.setItem('preferredLanguage', lang, {
      type: StorageType.LOCAL
    });

    if (reload) {
      window.location.reload();
    }
  }

  getCurrentLanguageLabel(): string {
    const language = this.languages.find(l => l.key === this.currentLanguage);
    return language ? `${language.icon} ${language.label}` : '🌐 语言';
  }
}
