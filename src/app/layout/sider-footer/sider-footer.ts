import { Component, inject } from '@angular/core';
import { LayoutService } from '../../layout.service';

@Component({
  selector: 'app-sider-footer',
  imports: [],
  templateUrl: './sider-footer.html',
  styleUrl: './sider-footer.css',
})
export class SiderFooter {
  layoutService = inject(LayoutService);

  appVersion = this.layoutService.getAppVersion().asReadonly();
}
