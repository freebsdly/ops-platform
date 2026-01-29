import { Component, computed, inject } from '@angular/core';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { LayoutService } from '../../layout.service';

@Component({
  selector: 'app-collapse-button',
  imports: [NzIconModule],
  templateUrl: './collapse-button.html',
  styleUrl: './collapse-button.css',
  host: {
    class: 'external-collapse-button',
    '[style.left.px]': 'leftPosition()'
  }
})
export class CollapseButton {
  layoutService = inject(LayoutService);
  isCollapsed = this.layoutService.isCollapsed.asReadonly();
  
  // 根据折叠状态计算left位置
  leftPosition = computed(() => {
    return this.isCollapsed() ? 48 : 248; // 折叠时48px，展开时248px
  });

  toggleCollapse() {
    this.layoutService.setCollapsed(!this.isCollapsed());
  }
}
