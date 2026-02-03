import { Component, input, computed } from '@angular/core';
import { Logo } from '../logo/logo';
import { LayoutConfig } from '../../core/types/layout-config.interface';

@Component({
  selector: 'app-sider-header',
  imports: [Logo],
  templateUrl: './sider-header.html',
  styleUrl: './sider-header.css',
})
export class SiderHeader {
  // 从父组件接收完整配置
  layoutConfig = input.required<LayoutConfig>();
  
  // 从父组件接收侧边栏状态
  isSiderCollapsed = input.required<boolean>();
  
  // 派生配置
  appTitle = computed(() => this.layoutConfig()?.appTitle || 'Ops Platform');
  logoConfig = computed(() => this.layoutConfig()?.logo);
}
