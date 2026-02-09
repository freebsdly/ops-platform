import { Component, input, computed, inject } from '@angular/core';
import { NzIconModule } from 'ng-zorro-antd/icon';
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
  logoConfigSig = toSignal(this.storeService.logoConfig$);

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
