import { Component, inject, ChangeDetectionStrategy, computed } from '@angular/core';
import { NzDropdownModule } from 'ng-zorro-antd/dropdown';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzFlexModule } from 'ng-zorro-antd/flex';
import { TranslateModule } from '@ngx-translate/core';
import { ModuleMenuService } from '../../services/module-menu.service';
import { StoreService } from '../../core/stores/store.service';
import { toSignal } from '@angular/core/rxjs-interop';
import { catchError, of, startWith } from 'rxjs';

interface ModuleOption {
  id: string;
  title: string;
  icon: string;
  color: string;
  defaultPath: string;
  isActive: boolean;
}

interface ModuleViewModel {
  id: string;
  title: string;
  icon: string;
  color: string;
  isSelected: boolean;
}

@Component({
  selector: 'app-module-selector',
  imports: [NzDropdownModule, NzIconModule, NzFlexModule, TranslateModule],
  templateUrl: './module-selector.html',
  styleUrl: './module-selector.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ModuleSelector {
  private storeService = inject(StoreService);
  private moduleMenuService = inject(ModuleMenuService);

  // Signals for reactive state
  currentModuleId = toSignal(this.storeService.currentModule$, { initialValue: null });
  
  // Convert observable to signal with error handling
  availableModules = toSignal(
    this.moduleMenuService.getAvailableModules().pipe(
      catchError((error) => {
        console.error('Failed to load modules:', error);
        return of([] as ModuleOption[]);
      }),
      startWith([] as ModuleOption[])
    ),
    { initialValue: [] as ModuleOption[] }
  );

  // Computed view model
  viewModel = computed(() => {
    const modules = this.availableModules();
    const currentModuleId = this.currentModuleId();
    
    return modules.map(module => ({
      id: module.id,
      title: module.title,
      icon: module.icon,
      color: module.color,
      isSelected: module.id === currentModuleId
    }));
  });

  // Current module icon for trigger button
  currentModuleIcon = computed(() => {
    const viewModel = this.viewModel();
    const current = viewModel.find(module => module.isSelected);
    return current?.icon || 'appstore';
  });

  selectModule(moduleId: string): void {
    this.storeService.setCurrentModule(moduleId);
    this.moduleMenuService.switchModule(moduleId);
  }

  trackByModuleId(_index: number, module: ModuleViewModel): string {
    return module.id;
  }
}
