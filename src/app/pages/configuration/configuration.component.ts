import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { RouteLoadingService } from '../../services/route-loading.service';
import { Loading } from '../../layout/loading/loading';

@Component({
  selector: 'app-configuration',
  template: `
    @if (loadingService.loading()) {
      <app-loading />
    }
    <router-outlet />
  `,
  styles: [`
    :host {
      display: block;
      height: 100%;
    }
  `],
  imports: [
    CommonModule,
    RouterOutlet,
    Loading
  ]
})
export class ConfigurationComponent {
  protected readonly loadingService = inject(RouteLoadingService);
}