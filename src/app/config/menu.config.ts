// src/app/config/menu.config.ts
// 外部化的菜单配置文件，集中管理模块和菜单数据

export interface MenuItem {
  text: string;
  icon?: string;
  link?: string;
  children?: MenuItem[];
  open?: boolean;
}

export interface ModuleConfig {
  id: string;
  title: string;
  icon: string;
  color: string;
  defaultPath: string;  // 模块的默认路由路径，用于智能识别
}

// 模块配置 - 定义所有可用的模块
export const MODULES_CONFIG: ModuleConfig[] = [
  {
    id: 'dashboard',
    title: 'MODULE_SELECTOR.DASHBOARD',
    icon: 'dashboard',
    color: '#1890ff',
    defaultPath: '/welcome',
  },
  {
    id: 'forms',
    title: 'MODULE_SELECTOR.FORMS',
    icon: 'form',
    color: '#52c41a',
    defaultPath: '/form/basic',
  },
  {
    id: 'monitor',
    title: 'MODULE_SELECTOR.MONITOR',
    icon: 'monitor',
    color: '#faad14',
    defaultPath: '/monitor/system',
  },
  {
    id: 'reports',
    title: 'MODULE_SELECTOR.REPORTS',
    icon: 'file-text',
    color: '#722ed1',
    defaultPath: '/reports/daily',
  },
  {
    id: 'settings',
    title: 'MODULE_SELECTOR.SETTINGS',
    icon: 'setting',
    color: '#8c8c8c',
    defaultPath: '/settings/general',
  },
];

// 菜单配置 - 按模块ID组织
export const MENUS_CONFIG: Record<string, MenuItem[]> = {
  dashboard: [
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
  forms: [
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
  monitor: [
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
  reports: [
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
  settings: [
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
};