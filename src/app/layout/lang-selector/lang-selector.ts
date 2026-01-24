import { Component, inject, AfterViewInit, ChangeDetectionStrategy } from '@angular/core';
import { NzDropdownModule } from 'ng-zorro-antd/dropdown';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzMenuModule } from 'ng-zorro-antd/menu';
import { NzI18nService, zh_CN, en_US, NzI18nInterface } from 'ng-zorro-antd/i18n';

@Component({
  selector: 'app-lang-selector',
  imports: [NzDropdownModule, NzIconModule, NzMenuModule],
  templateUrl: './lang-selector.html',
  styleUrl: './lang-selector.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LangSelector implements AfterViewInit {
  private i18n = inject(NzI18nService);

  currentLanguage = 'zh';

  languages = [
    { key: 'zh', label: '简体中文', icon: '🇨🇳', locale: zh_CN },
    { key: 'en', label: 'English', icon: '🇺🇸', locale: en_US },
  ];

  ngAfterViewInit() {
    const savedLang = localStorage.getItem('preferredLanguage');
    if (savedLang) {
      this.changeLanguage(savedLang, false);
    }
  }

  changeLanguage(lang: string, reload: boolean = true): void {
    const language = this.languages.find(l => l.key === lang);
    if (!language) return;

    this.currentLanguage = lang;
    this.i18n.setLocale(language.locale as NzI18nInterface);
    localStorage.setItem('preferredLanguage', lang);

    if (reload) {
      window.location.reload();
    }
  }

  getCurrentLanguageLabel(): string {
    const language = this.languages.find(l => l.key === this.currentLanguage);
    return language ? `${language.icon} ${language.label}` : '🌐 语言';
  }
}
