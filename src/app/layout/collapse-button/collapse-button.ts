import { Component, inject } from '@angular/core';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { LayoutService } from '../../layout.service';

@Component({
  selector: 'app-collapse-button',
  imports: [NzIconModule],
  templateUrl: './collapse-button.html',
  styleUrl: './collapse-button.css',
  host: {
    class: 'app-collapse-button'
  }
})
export class CollapseButton {
  layoutService = inject(LayoutService);
  isCollapsed = this.layoutService.isCollapsed.asReadonly();

  toggleCollapse() {
    this.layoutService.setCollapsed(!this.isCollapsed());
  }
}
