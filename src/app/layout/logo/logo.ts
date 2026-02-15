import { Component, input, computed, inject } from '@angular/core';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { StoreService } from '../../core/stores/store.service';
import { toSignal } from '@angular/core/rxjs-interop';
import { LayoutConfig } from '../../core/types/layout-config.interface';

@Component({
  selector: 'app-logo',
  imports: [NzIconModule],
  templateUrl: './logo.html',
  styleUrl: './logo.css',
})
export class Logo {
  private storeService = inject(StoreService);

  isCollapsed = input.required<boolean>();
  // 优先使用父组件传递的配置
  layoutConfig = input<LayoutConfig>();

  // 从StoreService获取状态（作为fallback）
  logoConfigFromStoreSig = toSignal(this.storeService.logoConfig$);

  // 使用配置：优先使用input，其次使用store
  logoConfigSig = computed(() => {
    const inputConfig = this.layoutConfig();
    if (inputConfig?.logo) {
      return inputConfig.logo;
    }
    return this.logoConfigFromStoreSig();
  });

  // 从配置派生属性
  logoSrc = computed(() => this.logoConfigSig()?.src);
  logoAlt = computed(() => this.logoConfigSig()?.alt);
  logoLink = computed(() => this.logoConfigSig()?.link);
  logoWidth = computed(() => this.logoConfigSig()?.width);
  logoHeight = computed(() => this.logoConfigSig()?.height);
  isVisible = computed(() => this.logoConfigSig()?.visible ?? true);
  logoCollapsedIcon = computed(() => this.logoConfigSig()?.collapsedIcon);
  logoExpandedIcon = computed(() => this.logoConfigSig()?.expandedIcon);
  logoTitle = computed(() => this.logoConfigSig()?.alt);
  
  // 显示逻辑
  showTitle = computed(() => !this.isCollapsed() && !!this.logoTitle());
  showImage = computed(() => this.isVisible() && !!this.logoSrc() && !this.isCollapsed());
  showIcon = computed(() => {
    // 在折叠状态下，总是显示图标
    if (this.isCollapsed()) {
      return this.isVisible() && !!this.iconType();
    }
    // 在展开状态下，如果没有logo图片，显示图标
    return this.isVisible() && !this.logoSrc() && !!this.iconType();
  });
  iconType = computed(() =>
    this.isCollapsed()
      ? this.logoCollapsedIcon()
      : this.logoExpandedIcon()
  );

  // 调试日志
  constructor() {
    console.log('[Logo] constructor called');
    
    setTimeout(() => {
      console.log('[Logo] layoutConfig input:', this.layoutConfig());
      console.log('[Logo] logoConfigFromStoreSig:', this.logoConfigFromStoreSig());
      console.log('[Logo] logoConfigSig:', this.logoConfigSig());
      console.log('[Logo] showImage:', this.showImage());
    }, 200);
  }
}