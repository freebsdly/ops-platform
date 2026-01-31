import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ModuleSelector } from './module-selector';
import { NzDropdownModule } from 'ng-zorro-antd/dropdown';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { TranslateModule } from '@ngx-translate/core';
import { StoreService } from '../../core/stores/store.service';
import { ModuleMenuService } from '../../services/module-menu.service';
import { of } from 'rxjs';
import { vi } from 'vitest';

// Simple mock services
const mockStoreService = {
  currentModule$: of('dashboard'),
  setCurrentModule: vi.fn()
};

const mockModuleMenuService = {
  getAvailableModules: vi.fn().mockReturnValue(of([
    {
      id: 'dashboard',
      title: 'Dashboard',
      icon: 'dashboard',
      color: '#1890ff',
      defaultPath: '/dashboard',
      isActive: true
    }
  ])),
  switchModule: vi.fn()
};

describe('ModuleSelector', () => {
  let component: ModuleSelector;
  let fixture: ComponentFixture<ModuleSelector>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        ModuleSelector,
        NzDropdownModule,
        NzIconModule,
        TranslateModule.forRoot()
      ],
      providers: [
        { provide: StoreService, useValue: mockStoreService },
        { provide: ModuleMenuService, useValue: mockModuleMenuService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ModuleSelector);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have current module id', () => {
    expect(component.currentModuleId()).toBe('dashboard');
  });

  it('should load available modules', () => {
    expect(component.availableModules()).toHaveLength(1);
    expect(component.availableModules()[0].id).toBe('dashboard');
  });

  it('should select module', () => {
    component.selectModule('dashboard');
    expect(mockStoreService.setCurrentModule).toHaveBeenCalledWith('dashboard');
    expect(mockModuleMenuService.switchModule).toHaveBeenCalledWith('dashboard');
  });
});