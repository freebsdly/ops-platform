import { Component, inject } from '@angular/core';
import { LayoutService } from '../../layout.service';
import { Logo } from '../logo/logo';

@Component({
  selector: 'app-sider-header',
  imports: [Logo],
  templateUrl: './sider-header.html',
  styleUrl: './sider-header.css',
})
export class SiderHeader {
  protected layoutService = inject(LayoutService);
  title = 'Ops Platform';
}
