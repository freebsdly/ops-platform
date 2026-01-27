import { Component, inject, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { NzDropdownModule } from 'ng-zorro-antd/dropdown';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzFlexModule } from 'ng-zorro-antd/flex';
import { Router } from '@angular/router';
import { signal, computed } from '@angular/core';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { LayoutService, MenuItem } from '../../layout.service';

export interface ModuleOption {
  id: string;
  title: string;
  icon: string;
  link?: string;
  color: string;
  menuData: MenuItem[];
}

@Component({
  selector: 'app-module-selector',
  imports: [NzDropdownModule, NzIconModule, NzFlexModule, TranslateModule],
  templateUrl: './module-selector.html',
  styleUrl: './module-selector.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ModuleSelector implements OnInit {
  private router = inject(Router);
  private translate = inject(TranslateService);
  private layoutService = inject(LayoutService);

  currentModule = signal('dashboard');

  modules = signal<ModuleOption[]>([
    {
      id: 'dashboard',
      title: 'MODULE_SELECTOR.DASHBOARD',
      icon: 'dashboard',
      link: '/welcome',
      color: '#1890ff',
      menuData: [
        {
          text: 'Dashboard',
          icon: 'dashboard',
          open: true,
          children: [
            { text: 'Welcome', link: '/welcome' },
            { text: 'Monitor' },
            { text: 'Workplace' },
          ],
        },
        {
          text: 'Analytics',
          icon: 'line-chart',
          open: true,
          children: [
            { text: 'Performance', link: '/dashboard/performance' },
            { text: 'Trends', link: '/dashboard/trends' },
          ],
        },
      ],
    },
    {
      id: 'forms',
      title: 'MODULE_SELECTOR.FORMS',
      icon: 'form',
      link: '/form/basic',
      color: '#52c41a',
      menuData: [
        {
          text: 'Form',
          icon: 'form',
          open: true,
          children: [
            { text: 'Basic Form', link: '/form/basic' },
            { text: 'Step Form', link: '/form/step' },
            { text: 'Advanced Form', link: '/form/advanced' },
          ],
        },
        {
          text: 'Validation',
          icon: 'check-circle',
          open: true,
          children: [
            { text: 'Input Validation', link: '/form/validation/input' },
            { text: 'Form Rules', link: '/form/validation/rules' },
          ],
        },
      ],
    },
    {
      id: 'monitor',
      title: 'MODULE_SELECTOR.MONITOR',
      icon: 'monitor',
      color: '#faad14',
      menuData: [
        {
          text: 'Monitoring',
          icon: 'monitor',
          open: true,
          children: [
            { text: 'System Status', link: '/monitor/system' },
            { text: 'Service Health', link: '/monitor/health' },
            { text: 'Performance Metrics', link: '/monitor/metrics' },
          ],
        },
        {
          text: 'Alerts',
          icon: 'alert',
          open: true,
          children: [
            { text: 'Alert Rules', link: '/monitor/alerts/rules' },
            { text: 'Incidents', link: '/monitor/alerts/incidents' },
          ],
        },
      ],
    },
    {
      id: 'reports',
      title: 'MODULE_SELECTOR.REPORTS',
      icon: 'file-text',
      color: '#722ed1',
      menuData: [
        {
          text: 'Reports',
          icon: 'file-text',
          open: true,
          children: [
            { text: 'Daily Report', link: '/reports/daily' },
            { text: 'Weekly Report', link: '/reports/weekly' },
            { text: 'Monthly Report', link: '/reports/monthly' },
          ],
        },
        {
          text: 'Analysis',
          icon: 'bar-chart',
          open: true,
          children: [
            { text: 'Data Analysis', link: '/reports/analysis/data' },
            { text: 'Trend Analysis', link: '/reports/analysis/trends' },
          ],
        },
      ],
    },
    {
      id: 'settings',
      title: 'MODULE_SELECTOR.SETTINGS',
      icon: 'setting',
      color: '#8c8c8c',
      menuData: [
        {
          text: 'Settings',
          icon: 'setting',
          open: true,
          children: [
            { text: 'General', link: '/settings/general' },
            { text: 'Notifications', link: '/settings/notifications' },
            { text: 'Security', link: '/settings/security' },
          ],
        },
        {
          text: 'System',
          icon: 'cloud-server',
          open: true,
          children: [
            { text: 'Users', link: '/settings/system/users' },
            { text: 'Roles', link: '/settings/system/roles' },
            { text: 'Permissions', link: '/settings/system/permissions' },
          ],
        },
      ],
    },
  ]);

  currentModuleData = computed(() => {
    return this.modules().find(m => m.id === this.currentModule());
  });

  selectModule(module: ModuleOption): void {
    this.currentModule.set(module.id);
    this.layoutService.setMenuData(module.menuData);
    if (module.link) {
      this.router.navigate([module.link]);
    }
  }

  trackByModuleId(index: number, module: ModuleOption): string {
    return module.id;
  }

  ngOnInit(): void {
    // 设置默认模块的菜单数据
    const defaultModule = this.modules().find(m => m.id === this.currentModule());
    if (defaultModule) {
      this.layoutService.setMenuData(defaultModule.menuData);
    }
  }
}
