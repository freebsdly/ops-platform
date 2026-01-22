import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class LayoutService {
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
