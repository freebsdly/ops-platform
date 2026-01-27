import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { NzDropdownModule } from 'ng-zorro-antd/dropdown';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzFlexModule } from 'ng-zorro-antd/flex';
import { TranslateModule } from '@ngx-translate/core';
import { ModuleMenuService } from '../../services/module-menu.service';

@Component({
  selector: 'app-module-selector',
  imports: [NzDropdownModule, NzIconModule, NzFlexModule, TranslateModule],
  templateUrl: './module-selector.html',
  styleUrl: './module-selector.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ModuleSelector {
  private moduleMenuService = inject(ModuleMenuService);

  // 从服务获取信号
  modules = this.moduleMenuService.availableModules;
  currentModule = this.moduleMenuService.currentModule;

  // 计算属性
  currentModuleData = this.moduleMenuService.currentModule;

  selectModule(moduleId: string): void {
    this.moduleMenuService.switchModule(moduleId);
  }

  trackByModuleId(index: number, module: any): string {
    return module.id;
  }
}
