import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component } from '@angular/core';
import { provideRouter } from '@angular/router';
import { ModuleSelector } from './module-selector';
import { NzDropdownModule } from 'ng-zorro-antd/dropdown';
import { NzIconModule } from 'ng-zorro-antd/icon';

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
      imports: [ModuleSelector, NzDropdownModule, NzIconModule, TestHostComponent],
      providers: [provideRouter([])],
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
