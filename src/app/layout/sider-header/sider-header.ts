import { Component, input } from '@angular/core';
import { Logo } from '../logo/logo';
import { LayoutConfig } from '../../core/types/layout-config.interface';

@Component({
  selector: 'app-sider-header',
  imports: [Logo],
  templateUrl: './sider-header.html',
  styleUrl: './sider-header.css',
})
export class SiderHeader {
  // 从父组件接收侧边栏状态
  isSiderCollapsed = input.required<boolean>();
  // 从父组件接收布局配置
  layoutConfig = input<LayoutConfig>();
}
