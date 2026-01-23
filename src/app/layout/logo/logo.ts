import { Component, input, computed } from '@angular/core';
import { NzIconModule } from 'ng-zorro-antd/icon';

@Component({
  selector: 'app-logo',
  imports: [NzIconModule],
  templateUrl: './logo.html',
  styleUrl: './logo.css',
})
export class Logo {
  isCollapsed = input.required<boolean>();
  title = input('');

  showTitle = computed(() => !this.isCollapsed() && !!this.title());
}
