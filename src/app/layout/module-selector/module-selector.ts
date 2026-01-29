import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { NzDropdownModule } from 'ng-zorro-antd/dropdown';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzFlexModule } from 'ng-zorro-antd/flex';
import { TranslateModule } from '@ngx-translate/core';
import { ModuleMenuService } from '../../services/module-menu.service';
import { StoreService } from '../../core/stores/store.service';
import { AsyncPipe } from '@angular/common';
import { Observable } from 'rxjs';

interface ModuleOption {
  id: string;
  title: string;
  icon: string;
  color: string;
  defaultPath: string;
  isActive: boolean;
}

@Component({
  selector: 'app-module-selector',
  imports: [NzDropdownModule, NzIconModule, NzFlexModule, TranslateModule, AsyncPipe],
  templateUrl: './module-selector.html',
  styleUrl: './module-selector.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ModuleSelector {
  private storeService = inject(StoreService);
  private moduleMenuService = inject(ModuleMenuService);

  // NgRx state observables
  modules$ = this.storeService.modules$;
  currentModule$ = this.storeService.currentModule$;
  
  // Module data from service
  availableModules$: Observable<ModuleOption[]> = this.moduleMenuService.getAvailableModules();

  selectModule(moduleId: string): void {
    this.storeService.setCurrentModule(moduleId);
    this.moduleMenuService.switchModule(moduleId);
  }

  trackByModuleId(index: number, module: any): string {
    return module.id;
  }
}
