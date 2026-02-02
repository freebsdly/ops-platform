import { http, HttpResponse } from 'msw';
import { LayoutConfig, DEFAULT_LAYOUT_CONFIG } from '../../app/core/types/layout-config.interface';

// 模拟配置数据
const mockConfig: LayoutConfig = {
  ...DEFAULT_LAYOUT_CONFIG,
  appTitle: 'DevOps Ops Platform',
  logo: {
    ...DEFAULT_LAYOUT_CONFIG.logo,
    src: 'https://img.icons8.com/color/96/000000/administrative-tools.png',
    alt: 'DevOps Tools Logo',
    link: '/',
    width: '32px',
    height: '32px',
    visible: true,
    collapsedIcon: 'tool',
    expandedIcon: 'tool'
  },
  theme: {
    ...DEFAULT_LAYOUT_CONFIG.theme,
    mode: 'light',
    primaryColor: '#1890ff',
    secondaryColor: '#52c41a'
  },
  sidebar: {
    ...DEFAULT_LAYOUT_CONFIG.sidebar,
    width: 220,
    backgroundColor: '#001529',
    textColor: '#ffffff'
  },
  header: {
    ...DEFAULT_LAYOUT_CONFIG.header,
    showBreadcrumb: true,
    showUserInfo: true,
    showLangSelector: true,
    showThemeSwitcher: true
  },
  footer: {
    ...DEFAULT_LAYOUT_CONFIG.footer,
    content: '© 2024 DevOps Ops Platform. Powered by Angular & Ant Design.',
    visible: true
  }
};

export const layoutConfigHandlers = [
  // 获取布局配置
  http.get('/api/config/layout', () => {
    return HttpResponse.json(mockConfig);
  }),

  // 保存布局配置
  http.post('/api/config/layout', async ({ request }) => {
    const config = await request.json() as LayoutConfig;
    
    // 更新配置（在实际实现中应该合并而不是替换）
    Object.assign(mockConfig, config);
    
    return HttpResponse.json(mockConfig);
  }),

  // 获取Logo配置
  http.get('/api/config/logo', () => {
    return HttpResponse.json(mockConfig.logo);
  }),

  // 获取主题配置
  http.get('/api/config/theme', () => {
    return HttpResponse.json(mockConfig.theme);
  }),

  // 获取侧边栏配置
  http.get('/api/config/sidebar', () => {
    return HttpResponse.json(mockConfig.sidebar);
  }),

  // 获取页头配置
  http.get('/api/config/header', () => {
    return HttpResponse.json(mockConfig.header);
  }),

  // 获取页脚配置
  http.get('/api/config/footer', () => {
    return HttpResponse.json(mockConfig.footer);
  }),

  // 验证配置
  http.post('/api/config/validate', async ({ request }) => {
    const config = await request.json() as Partial<LayoutConfig>;
    const errors: string[] = [];

    // 简单的验证逻辑
    if (config.appTitle && config.appTitle.length > 100) {
      errors.push('应用标题不能超过100个字符');
    }

    if (config.logo?.src && !isValidUrl(config.logo.src)) {
      errors.push('Logo图片URL格式无效');
    }

    return HttpResponse.json({
      valid: errors.length === 0,
      errors
    });
  }),

  // 获取应用配置
  http.get('/api/config/app', () => {
    return HttpResponse.json({
      version: '1.2.0',
      environment: 'development',
      apiUrl: 'http://localhost:3000/api',
      features: {
        multiTenancy: true,
        auditLog: true,
        notifications: true,
        darkMode: true
      }
    });
  })
];

// 检查URL是否有效
function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}