import { Component, input, computed, inject } from '@angular/core';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { LogoConfig } from '../../core/types/layout-config.interface';
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
  
  // 直接从StoreService获取状态
  logoConfigSig = toSignal(this.storeService.logoConfig$, { 
    initialValue: null 
  });
  
  // 从配置派生属性
  logoSrc = computed(() => this.logoConfigSig()?.src || 'https://ng.ant.design/assets.img/logo.svg');
  logoAlt = computed(() => this.logoConfigSig()?.alt || 'Logo');
  logoLink = computed(() => this.logoConfigSig()?.link);
  logoWidth = computed(() => this.logoConfigSig()?.width || '32px');
  logoHeight = computed(() => this.logoConfigSig()?.height || '32px');
  isVisible = computed(() => this.logoConfigSig()?.visible ?? true);
  logoCollapsedIcon = computed(() => this.logoConfigSig()?.collapsedIcon || 'bars');
  logoExpandedIcon = computed(() => this.logoConfigSig()?.expandedIcon || 'bars');
  logoTitle = computed(() => this.logoConfigSig()?.alt || 'Logo');
  
  // 显示逻辑
  showTitle = computed(() => !this.isCollapsed() && !!this.logoTitle());
  showImage = computed(() => this.isVisible() && !!this.logoSrc());
  showIcon = computed(() => this.isVisible() && (!this.logoSrc() || this.isCollapsed()));
  iconType = computed(() => 
    this.isCollapsed() 
      ? this.logoCollapsedIcon() || 'bars'
      : this.logoExpandedIcon() || 'bars'
  );
}
