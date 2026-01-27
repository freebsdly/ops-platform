import { Injectable, signal } from '@angular/core';
import { inject } from '@angular/core';
import { Router } from '@angular/router';

export interface MenuItem {
  text: string;
  icon?: string;
  link?: string;
  children?: MenuItem[];
  open?: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class LayoutService {
  private router = inject(Router);
  isCollapsed = signal(false);
  private appVersion = signal('v1.0.0');

  toggle() {
    this.isCollapsed.update((v) => !v);
  }

  setCollapsed(collapsed: boolean) {
    this.isCollapsed.set(collapsed);
  }

  getAppVersion() {
    return this.appVersion;
  }
}
