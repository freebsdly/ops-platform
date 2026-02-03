import { Component, input } from '@angular/core';
import { LayoutConfig } from '../../core/types/layout-config.interface';

@Component({
  selector: 'app-sider',
  templateUrl: './sider.html',
  styleUrl: './sider.css',
})
export class Sider {
  // 从父组件接收配置
  layoutConfig = input<LayoutConfig>();
  isSiderCollapsed = input<boolean>(false);
}
