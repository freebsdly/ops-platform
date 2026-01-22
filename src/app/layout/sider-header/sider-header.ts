import { Component, input, computed } from '@angular/core';

@Component({
  selector: 'app-sider-header',
  imports: [],
  templateUrl: './sider-header.html',
  styleUrl: './sider-header.css',
})
export class SiderHeader {
  logoSrc = input('');
  title = input('');
  logoLink = input('');

  showLogo = computed(() => !!this.logoSrc());
  showTitle = computed(() => !!this.title());
}
