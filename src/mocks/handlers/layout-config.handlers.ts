import { http, HttpResponse } from 'msw';
import { LayoutConfig } from '../../app/core/types/layout-config.interface';

// 模拟配置数据
const mockConfig: LayoutConfig = {
  appTitle: 'DevOps Platform',
  appVersion: '1.2.0',
  logo: {
    src: 'https://img.icons8.com/color/96/000000/administrative-tools.png',
    alt: 'DevOps Platform',
    link: '/',
    width: '32px',
    height: '32px',
    visible: true,
    collapsedIcon: 'tool',
    expandedIcon: 'tool'
  },
  theme: {
    mode: 'light',
    primaryColor: '#1890ff',
    secondaryColor: '#52c41a',
    backgroundColor: '#ffffff',
    textColor: '#262626',
    borderColor: '#d9d9d9'
  },
  sidebar: {
    width: 220,
    collapsedWidth: 80,
    defaultCollapsed: false,
    collapsible: true,
    backgroundColor: '#001529',
    textColor: '#ffffff',
    menu: {
      mode: 'vertical',
      theme: 'dark',
      multiple: false,
      autoOpen: true,
      items: []
    }
  },
  header: {
    height: 64,
    backgroundColor: '#ffffff',
    textColor: '#262626',
    fixed: true,
    showBreadcrumb: true,
    showUserInfo: true,
    showLangSelector: true,
    showThemeSwitcher: true
  },
  footer: {
    height: 48,
    backgroundColor: '#f0f2f5',
    textColor: '#8c8c8c',
    content: '© 2024 DevOps Platform. Powered by Angular & Ant Design.',
    visible: false,
    fixed: false
  },
  showSiderFooter: true
};

export const layoutConfigHandlers = [
  // 获取完整布局配置 - 单次API调用获取所有配置
  http.get('/api/config/layout', () => {
    // 测试：随机失败，50%概率返回错误
    // const shouldFail = Math.random() > 0.5;
    // if (shouldFail) {
    //   return new HttpResponse(null, {
    //     status: 500,
    //     statusText: 'Internal Server Error'
    //   });
    // }
    return HttpResponse.json(mockConfig);
  }),

  // 保存布局配置
  http.post('/api/config/layout', async ({ request }) => {
    const config = await request.json() as LayoutConfig;
    
    // 更新配置（在实际实现中应该合并而不是替换）
    Object.assign(mockConfig, config);
    
    return HttpResponse.json(mockConfig);
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

  // 获取应用配置（独立配置，不属于布局配置）
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