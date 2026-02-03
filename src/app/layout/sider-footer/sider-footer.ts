import { Component, input, computed } from '@angular/core';
import { LayoutConfig } from '../../core/types/layout-config.interface';

@Component({
  selector: 'app-sider-footer',
  imports: [],
  templateUrl: './sider-footer.html',
  styleUrl: './sider-footer.css',
})
export class SiderFooter {
  // 从父组件接收配置
  layoutConfig = input<LayoutConfig>();
  isSiderCollapsed = input<boolean>(false);
  
  // 从配置中获取信息
  appVersion = computed(() => '1.0.0'); // 暂时硬编码，后续可以从配置中获取
}
