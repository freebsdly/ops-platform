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
  
  // 检查配置是否已加载
  hasConfig = computed(() => !!this.layoutConfig());
  
  // 从配置中获取信息，如果配置未加载则返回null
  appVersion = computed(() => {
    const config = this.layoutConfig();
    return config?.appVersion;
  });
  
  // 是否显示sider footer
  showSiderFooter = computed(() => {
    const config = this.layoutConfig();
    return config?.showSiderFooter ?? true;
  });
}
