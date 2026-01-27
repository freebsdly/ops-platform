import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component, NO_ERRORS_SCHEMA } from '@angular/core';
import { provideRouter } from '@angular/router';
import { ModuleSelector } from './module-selector';
import { NzDropdownModule } from 'ng-zorro-antd/dropdown';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Observable, Subject } from 'rxjs';

const translations = {
  MODULE_SELECTOR: {
    TITLE: 'Select Module',
    DASHBOARD: 'Dashboard',
    FORMS: 'Forms',
    MONITOR: 'Monitor',
    REPORTS: 'Reports',
    SETTINGS: 'Settings',
  },
};

@Component({
  template: `<app-module-selector />`,
  imports: [ModuleSelector],
})
class TestHostComponent {}

describe('ModuleSelector', () => {
  let component: ModuleSelector;
  let fixture: ComponentFixture<ModuleSelector>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      schemas: [NO_ERRORS_SCHEMA],
      imports: [
        ModuleSelector,
        NzDropdownModule,
        NzIconModule,
        TranslateModule.forChild(),
        TestHostComponent,
      ],
      providers: [
        provideRouter([]),
        {
          provide: TranslateService,
          useValue: {
            get: (key: string | string[]) => {
              const k = Array.isArray(key) ? key[0] : key;
              const keys = k.split('.');
              let value: any = translations;
              for (const keyPart of keys) {
                value = value?.[keyPart];
              }
              return new Observable((observer) => {
                observer.next(value || k);
                observer.complete();
                return { unsubscribe: () => {} };
              });
            },
            instant: (key: string | string[]) => {
              const k = Array.isArray(key) ? key[0] : key;
              const keys = k.split('.');
              let value: any = translations;
              for (const keyPart of keys) {
                value = value?.[keyPart];
              }
              return value || k;
            },
            onLangChange: new Subject(),
            onTranslationChange: new Subject(),
            onDefaultLangChange: new Subject(),
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ModuleSelector);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with dashboard as current module', () => {
    expect(component.currentModule()).toBe('dashboard');
  });

  it('should have modules data', () => {
    expect(component.modules().length).toBeGreaterThan(0);
    expect(component.modules().find(m => m.id === 'dashboard')).toBeDefined();
  });

  it('should select module and update current module', () => {
    const testModule = component.modules().find(m => m.id === 'forms');
    component.selectModule(testModule!);
    expect(component.currentModule()).toBe('forms');
  });

  it('should return correct current module data', () => {
    component.currentModule.set('dashboard');
    const current = component.currentModuleData();
    expect(current?.id).toBe('dashboard');
  });

  it('should track modules by id', () => {
    const modules = component.modules();
    const trackId = component.trackByModuleId(0, modules[0]);
    expect(trackId).toBe(modules[0].id);
  });
});
