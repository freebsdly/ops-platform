// src/app/config/menu.config.ts
// 外部化的菜单配置文件，集中管理模块和菜单数据

export interface MenuItem {
  key: string;       // 国际化键值，用于翻译
  text: string;      // 显示文本（供参考和默认值）
  icon: string;      // 图标（必须）
  link?: string;     // 路由链接
  children?: MenuItem[]; // 子菜单
  open?: boolean;    // 是否默认展开
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
// 使用国际化键值（key）和统一图标配置
export const MENUS_CONFIG: Record<string, MenuItem[]> = {
  dashboard: [
    {
      key: 'MENU.DASHBOARD_MAIN',
      text: 'Dashboard',
      icon: 'dashboard',
      open: true,
      children: [
        { key: 'MENU.WELCOME', text: 'Welcome', icon: 'home', link: '/welcome' },
        { key: 'MENU.MONITOR_DASH', text: 'Monitor', icon: 'desktop' },
        { key: 'MENU.WORKPLACE', text: 'Workplace', icon: 'appstore' },
      ],
    },
    {
      key: 'MENU.ANALYTICS',
      text: 'Analytics',
      icon: 'line-chart',
      open: true,
      children: [
        { key: 'MENU.PERFORMANCE', text: 'Performance', icon: 'rocket', link: '/dashboard/performance' },
        { key: 'MENU.TRENDS', text: 'Trends', icon: 'rise', link: '/dashboard/trends' },
      ],
    },
  ],
  forms: [
    {
      key: 'MENU.FORM',
      text: 'Form',
      icon: 'form',
      open: true,
      children: [
        { key: 'MENU.BASIC_FORM', text: 'Basic Form', icon: 'form', link: '/form/basic' },
        { key: 'MENU.STEP_FORM', text: 'Step Form', icon: 'branches', link: '/form/step' },
        { key: 'MENU.ADVANCED_FORM', text: 'Advanced Form', icon: 'tool', link: '/form/advanced' },
      ],
    },
    {
      key: 'MENU.VALIDATION',
      text: 'Validation',
      icon: 'check-circle',
      open: true,
      children: [
        { key: 'MENU.INPUT_VALIDATION', text: 'Input Validation', icon: 'enter', link: '/form/validation/input' },
        { key: 'MENU.FORM_RULES', text: 'Form Rules', icon: 'safety-certificate', link: '/form/validation/rules' },
      ],
    },
  ],
  monitor: [
    {
      key: 'MENU.MONITORING',
      text: 'Monitoring',
      icon: 'monitor',
      open: true,
      children: [
        { key: 'MENU.SYSTEM_STATUS', text: 'System Status', icon: 'dashboard', link: '/monitor/system' },
        { key: 'MENU.SERVICE_HEALTH', text: 'Service Health', icon: 'heart', link: '/monitor/health' },
        { key: 'MENU.PERFORMANCE_METRICS', text: 'Performance Metrics', icon: 'bar-chart', link: '/monitor/metrics' },
      ],
    },
    {
      key: 'MENU.ALERTS',
      text: 'Alerts',
      icon: 'alert',
      open: true,
      children: [
        { key: 'MENU.ALERT_RULES', text: 'Alert Rules', icon: 'warning', link: '/monitor/alerts/rules' },
        { key: 'MENU.INCIDENTS', text: 'Incidents', icon: 'exclamation-circle', link: '/monitor/alerts/incidents' },
      ],
    },
  ],
  reports: [
    {
      key: 'MENU.REPORTS',
      text: 'Reports',
      icon: 'file-text',
      open: true,
      children: [
        { key: 'MENU.DAILY_REPORT', text: 'Daily Report', icon: 'calendar', link: '/reports/daily' },
        { key: 'MENU.WEEKLY_REPORT', text: 'Weekly Report', icon: 'clock-circle', link: '/reports/weekly' },
        { key: 'MENU.MONTHLY_REPORT', text: 'Monthly Report', icon: 'calendar', link: '/reports/monthly' },
      ],
    },
    {
      key: 'MENU.ANALYSIS',
      text: 'Analysis',
      icon: 'bar-chart',
      open: true,
      children: [
        { key: 'MENU.DATA_ANALYSIS', text: 'Data Analysis', icon: 'pie-chart', link: '/reports/analysis/data' },
        { key: 'MENU.TREND_ANALYSIS', text: 'Trend Analysis', icon: 'line-chart', link: '/reports/analysis/trends' },
      ],
    },
  ],
  settings: [
    {
      key: 'MENU.SETTINGS',
      text: 'Settings',
      icon: 'setting',
      open: true,
      children: [
        { key: 'MENU.GENERAL_SETTINGS', text: 'General', icon: 'setting', link: '/settings/general' },
        { key: 'MENU.NOTIFICATION_SETTINGS', text: 'Notifications', icon: 'bell', link: '/settings/notifications' },
        { key: 'MENU.SECURITY_SETTINGS', text: 'Security', icon: 'lock', link: '/settings/security' },
      ],
    },
    {
      key: 'MENU.SYSTEM',
      text: 'System',
      icon: 'cloud-server',
      open: true,
      children: [
        { key: 'MENU.USER_MANAGEMENT', text: 'Users', icon: 'user', link: '/settings/system/users' },
        { key: 'MENU.ROLE_MANAGEMENT', text: 'Roles', icon: 'team', link: '/settings/system/roles' },
        { key: 'MENU.PERMISSION_MANAGEMENT', text: 'Permissions', icon: 'safety-certificate', link: '/settings/system/permissions' },
      ],
    },
  ],
};