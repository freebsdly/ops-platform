/**
 * 布局配置接口
 */
export interface LayoutConfig {
  /**
   * 应用标题
   */
  appTitle: string;
  
  /**
   * Logo配置
   */
  logo: LogoConfig;
  
  /**
   * 主题配置
   */
  theme: ThemeConfig;
  
  /**
   * 侧边栏配置
   */
  sidebar: SidebarConfig;
  
  /**
   * 页头配置
   */
  header: HeaderConfig;
  
  /**
   * 页脚配置
   */
  footer: FooterConfig;
  
  /**
   * 其他布局相关配置
   */
  [key: string]: any;
}

/**
 * Logo配置接口
 */
export interface LogoConfig {
  /**
   * Logo图片URL
   */
  src: string;
  
  /**
   * Logo图片alt文本
   */
  alt: string;
  
  /**
   * Logo点击跳转链接
   */
  link?: string;
  
  /**
   * Logo宽度（像素或百分比）
   */
  width?: string;
  
  /**
   * Logo高度（像素或百分比）
   */
  height?: string;
  
  /**
   * 是否显示Logo
   */
  visible: boolean;
  
  /**
   * 折叠状态下显示的图标
   */
  collapsedIcon?: string;
  
  /**
   * 展开状态下显示的图标
   */
  expandedIcon?: string;
}

/**
 * 主题配置接口
 */
export interface ThemeConfig {
  /**
   * 主题模式：light | dark | auto
   */
  mode: 'light' | 'dark' | 'auto';
  
  /**
   * 主题颜色
   */
  primaryColor: string;
  
  /**
   * 次要颜色
   */
  secondaryColor: string;
  
  /**
   * 背景颜色
   */
  backgroundColor: string;
  
  /**
   * 文字颜色
   */
  textColor: string;
  
  /**
   * 边框颜色
   */
  borderColor: string;
}

/**
 * 侧边栏配置接口
 */
export interface SidebarConfig {
  /**
   * 侧边栏宽度（展开状态）
   */
  width: number;
  
  /**
   * 侧边栏宽度（折叠状态）
   */
  collapsedWidth: number;
  
  /**
   * 默认是否折叠
   */
  defaultCollapsed: boolean;
  
  /**
   * 是否可折叠
   */
  collapsible: boolean;
  
  /**
   * 侧边栏背景颜色
   */
  backgroundColor: string;
  
  /**
   * 侧边栏文字颜色
   */
  textColor: string;
  
  /**
   * 菜单配置
   */
  menu: MenuConfig;
}

/**
 * 菜单配置接口
 */
export interface MenuConfig {
  /**
   * 菜单模式：vertical | horizontal | inline
   */
  mode: 'vertical' | 'horizontal' | 'inline';
  
  /**
   * 菜单主题：light | dark
   */
  theme: 'light' | 'dark';
  
  /**
   * 是否允许选择多个菜单项
   */
  multiple: boolean;
  
  /**
   * 是否自动展开父菜单
   */
  autoOpen: boolean;
  
  /**
   * 菜单项配置
   */
  items: MenuItemConfig[];
}

/**
 * 菜单项配置接口
 */
export interface MenuItemConfig {
  /**
   * 菜单项唯一标识
   */
  key: string;
  
  /**
   * 菜单项显示文本
   */
  label: string;
  
  /**
   * 菜单项图标
   */
  icon?: string;
  
  /**
   * 菜单项链接
   */
  link?: string;
  
  /**
   * 是否禁用
   */
  disabled?: boolean;
  
  /**
   * 是否隐藏
   */
  hidden?: boolean;
  
  /**
   * 子菜单项
   */
  children?: MenuItemConfig[];
}

/**
 * 页头配置接口
 */
export interface HeaderConfig {
  /**
   * 页头高度
   */
  height: number;
  
  /**
   * 页头背景颜色
   */
  backgroundColor: string;
  
  /**
   * 页头文字颜色
   */
  textColor: string;
  
  /**
   * 是否固定页头
   */
  fixed: boolean;
  
  /**
   * 是否显示面包屑
   */
  showBreadcrumb: boolean;
  
  /**
   * 是否显示用户信息
   */
  showUserInfo: boolean;
  
  /**
   * 是否显示语言选择器
   */
  showLangSelector: boolean;
  
  /**
   * 是否显示主题切换器
   */
  showThemeSwitcher: boolean;
}

/**
 * 页脚配置接口
 */
export interface FooterConfig {
  /**
   * 页脚高度
   */
  height: number;
  
  /**
   * 页脚背景颜色
   */
  backgroundColor: string;
  
  /**
   * 页脚文字颜色
   */
  textColor: string;
  
  /**
   * 页脚内容
   */
  content: string;
  
  /**
   * 是否显示页脚
   */
  visible: boolean;
  
  /**
   * 是否固定页脚
   */
  fixed: boolean;
}

/**
 * 默认布局配置
 */
export const DEFAULT_LAYOUT_CONFIG: LayoutConfig = {
  appTitle: 'Ops Platform',
  logo: {
    src: 'https://ng.ant.design/assets.img/logo.svg',
    alt: 'Logo',
    link: 'https://ng.ant.design/',
    width: '32px',
    height: '32px',
    visible: true,
    collapsedIcon: 'bars',
    expandedIcon: 'bars'
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
    width: 200,
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
    content: '© 2024 Ops Platform. All rights reserved.',
    visible: true,
    fixed: false
  }
};