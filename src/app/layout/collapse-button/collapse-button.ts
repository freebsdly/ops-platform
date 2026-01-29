import { Component, inject } from '@angular/core';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { StoreService } from '../../core/stores/store.service';
import { AsyncPipe } from '@angular/common';

@Component({
  selector: 'app-collapse-button',
  imports: [NzIconModule, AsyncPipe],
  templateUrl: './collapse-button.html',
  styleUrl: './collapse-button.css'
})
export class CollapseButton {
  private storeService = inject(StoreService);
  
  isSiderCollapsed$ = this.storeService.isSiderCollapsed$;

  toggleCollapse() {
    this.storeService.toggleSider();
  }
}
