import { Component, inject } from '@angular/core';
import { StoreService } from '../../core/stores/store.service';
import { Logo } from '../logo/logo';
import { toSignal } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-sider-header',
  imports: [Logo],
  templateUrl: './sider-header.html',
  styleUrl: './sider-header.css',
})
export class SiderHeader {
  protected storeService = inject(StoreService);
  
  // Signals from store
  isSiderCollapsedSig = toSignal(this.storeService.isSiderCollapsed$);
  appTitleSig = toSignal(this.storeService.appTitle$);
}
