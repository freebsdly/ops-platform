import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { NzDropdownModule } from 'ng-zorro-antd/dropdown';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzFlexModule } from 'ng-zorro-antd/flex';
import { Router } from '@angular/router';
import { signal, computed } from '@angular/core';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

export interface ModuleOption {
  id: string;
  title: string;
  icon: string;
  link?: string;
  color: string;
}

@Component({
  selector: 'app-module-selector',
  imports: [NzDropdownModule, NzIconModule, NzFlexModule, TranslateModule],
  templateUrl: './module-selector.html',
  styleUrl: './module-selector.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ModuleSelector {
  private router = inject(Router);
  private translate = inject(TranslateService);

  currentModule = signal('dashboard');

  modules = signal<ModuleOption[]>([
    {
      id: 'dashboard',
      title: 'MODULE_SELECTOR.DASHBOARD',
      icon: 'dashboard',
      link: '/welcome',
      color: '#1890ff',
    },
    {
      id: 'forms',
      title: 'MODULE_SELECTOR.FORMS',
      icon: 'form',
      link: '/form/basic',
      color: '#52c41a',
    },
    {
      id: 'monitor',
      title: 'MODULE_SELECTOR.MONITOR',
      icon: 'monitor',
      color: '#faad14',
    },
    {
      id: 'reports',
      title: 'MODULE_SELECTOR.REPORTS',
      icon: 'file-text',
      color: '#722ed1',
    },
    {
      id: 'settings',
      title: 'MODULE_SELECTOR.SETTINGS',
      icon: 'setting',
      color: '#8c8c8c',
    },
  ]);

  currentModuleData = computed(() => {
    return this.modules().find(m => m.id === this.currentModule());
  });

  selectModule(module: ModuleOption): void {
    this.currentModule.set(module.id);
    if (module.link) {
      this.router.navigate([module.link]);
    }
  }

  trackByModuleId(index: number, module: ModuleOption): string {
    return module.id;
  }
}
