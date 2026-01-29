import { Component, inject } from '@angular/core';
import { StoreService } from '../../core/stores/store.service';
import { Logo } from '../logo/logo';
import { AsyncPipe } from '@angular/common';

@Component({
  selector: 'app-sider-header',
  imports: [Logo, AsyncPipe],
  templateUrl: './sider-header.html',
  styleUrl: './sider-header.css',
})
export class SiderHeader {
  protected storeService = inject(StoreService);
  title = 'Ops Platform';
  
  isSiderCollapsed$ = this.storeService.isSiderCollapsed$;
}
