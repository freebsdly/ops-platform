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
  title = input('');
  
  // Signals from store
  logoSrcSig = toSignal(this.storeService.logoSrc$);
  logoAltSig = toSignal(this.storeService.logoAlt$);
  logoLinkSig = toSignal(this.storeService.logoLink$);
  logoCollapsedIconSig = toSignal(this.storeService.logoCollapsedIcon$);
  logoExpandedIconSig = toSignal(this.storeService.logoExpandedIcon$);
  
  showTitle = computed(() => !this.isCollapsed() && !!this.title());
  showImage = computed(() => !!this.logoSrcSig());
  showIcon = computed(() => !this.logoSrcSig() || this.isCollapsed());
  iconType = computed(() => 
    this.isCollapsed() 
      ? this.logoCollapsedIconSig() || 'bars'
      : this.logoExpandedIconSig() || 'bars'
  );
}
