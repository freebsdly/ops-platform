import { Component, input, computed, inject } from '@angular/core';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { LogoConfig, DEFAULT_LAYOUT_CONFIG } from '../../core/types/layout-config.interface';
import { StoreService } from '../../core/stores/store.service';
import { toSignal } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-logo',
  imports: [NzIconModule],
  templateUrl: './logo.html',
  styleUrl: './logo.css',
})
export class Logo {
  private storeService = inject(StoreService);

  isCollapsed = input.required<boolean>();

  // 直接从StoreService获取状态，使用默认配置作为初始值
  // 使用undefined合并运算符确保永远不会返回undefined或null
  rawLogoConfigSig = toSignal(this.storeService.logoConfig$, {
    initialValue: DEFAULT_LAYOUT_CONFIG.logo
  });

  // 确保logoConfigSig永远不会是undefined或null
  logoConfigSig = computed(() => {
    const config = this.rawLogoConfigSig();
    return config || DEFAULT_LAYOUT_CONFIG.logo;
  });

  // 从配置派生属性
  logoSrc = computed(() => this.logoConfigSig().src);
  logoAlt = computed(() => this.logoConfigSig().alt);
  logoLink = computed(() => this.logoConfigSig().link);
  logoWidth = computed(() => this.logoConfigSig().width);
  logoHeight = computed(() => this.logoConfigSig().height);
  isVisible = computed(() => this.logoConfigSig().visible);
  logoCollapsedIcon = computed(() => this.logoConfigSig().collapsedIcon);
  logoExpandedIcon = computed(() => this.logoConfigSig().expandedIcon);
  logoTitle = computed(() => this.logoConfigSig().alt);
  
  // 显示逻辑
  showTitle = computed(() => !this.isCollapsed() && !!this.logoTitle());
  showImage = computed(() => this.isVisible() && !!this.logoSrc() && !this.isCollapsed());
  showIcon = computed(() => {
    // 在折叠状态下，总是显示图标
    if (this.isCollapsed()) {
      return this.isVisible();
    }
    // 在展开状态下，如果没有logo图片，显示图标
    return this.isVisible() && !this.logoSrc();
  });
  iconType = computed(() =>
    this.isCollapsed()
      ? this.logoCollapsedIcon()
      : this.logoExpandedIcon()
  );
}
