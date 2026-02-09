import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SiderHeader } from './sider-header';

describe('SiderHeader', () => {
  let component: SiderHeader;
  let fixture: ComponentFixture<SiderHeader>;

  // 测试用的布局配置对象
  const testLayoutConfig = {
    appTitle: 'DevOps Platform',
    appVersion: '1.0.0',
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
      mode: 'light' as const,
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
        mode: 'vertical' as const,
        theme: 'dark' as const,
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
      content: '© 2024 DevOps Platform. All rights reserved.',
      visible: false,
      fixed: false
    },
    showSiderFooter: false
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SiderHeader],
    })
    .compileComponents();

    fixture = TestBed.createComponent(SiderHeader);
    component = fixture.componentInstance;
    
    // 设置必要的输入属性
    fixture.componentRef.setInput('layoutConfig', testLayoutConfig);
    fixture.componentRef.setInput('isSiderCollapsed', false);
    
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});