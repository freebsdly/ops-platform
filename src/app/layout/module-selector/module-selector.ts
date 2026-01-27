import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { NzDropdownModule } from 'ng-zorro-antd/dropdown';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzFlexModule } from 'ng-zorro-antd/flex';
import { Router } from '@angular/router';
import { signal, computed } from '@angular/core';

export interface ModuleOption {
  id: string;
  title: string;
  description: string;
  icon: string;
  link?: string;
  color: string;
}

@Component({
  selector: 'app-module-selector',
  imports: [NzDropdownModule, NzIconModule, NzFlexModule],
  templateUrl: './module-selector.html',
  styleUrl: './module-selector.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ModuleSelector {
  private router = inject(Router);

  currentModule = signal('dashboard');

  modules = signal<ModuleOption[]>([
    {
      id: 'dashboard',
      title: 'Dashboard',
      description: 'Overview and analytics',
      icon: 'dashboard',
      link: '/welcome',
      color: '#1890ff',
    },
    {
      id: 'forms',
      title: 'Forms',
      description: 'Form management',
      icon: 'form',
      link: '/form/basic',
      color: '#52c41a',
    },
    {
      id: 'monitor',
      title: 'Monitor',
      description: 'System monitoring',
      icon: 'monitor',
      color: '#faad14',
    },
    {
      id: 'reports',
      title: 'Reports',
      description: 'Data reports',
      icon: 'file-text',
      color: '#722ed1',
    },
    {
      id: 'settings',
      title: 'Settings',
      description: 'System settings',
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
