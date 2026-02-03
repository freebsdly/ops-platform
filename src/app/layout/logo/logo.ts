import { Component, input, computed } from '@angular/core';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { LogoConfig } from '../../core/types/layout-config.interface';

@Component({
  selector: 'app-logo',
  imports: [NzIconModule],
  templateUrl: './logo.html',
  styleUrl: './logo.css',
})
export class Logo {
  isCollapsed = input.required<boolean>();
  title = input('');
  config = input<LogoConfig>();
  
  // 从配置派生属性
  logoSrc = computed(() => this.config()?.src || 'https://ng.ant.design/assets.img/logo.svg');
  logoAlt = computed(() => this.config()?.alt || 'Logo');
  logoLink = computed(() => this.config()?.link || 'https://ng.ant.design/');
  logoCollapsedIcon = computed(() => this.config()?.collapsedIcon || 'bars');
  logoExpandedIcon = computed(() => this.config()?.expandedIcon || 'bars');
  
  showTitle = computed(() => !this.isCollapsed() && !!this.title());
  showImage = computed(() => !!this.logoSrc());
  showIcon = computed(() => !this.logoSrc() || this.isCollapsed());
  iconType = computed(() => 
    this.isCollapsed() 
      ? this.logoCollapsedIcon() || 'bars'
      : this.logoExpandedIcon() || 'bars'
  );
}
