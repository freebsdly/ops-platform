import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouteLoadingService } from '../services/route-loading.service';

@Component({
  selector: 'app-route-loading-indicator',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (loadingService.loading()) {
      <div class="route-loading-indicator">
        <div class="loading-overlay"></div>
        <div class="loading-content">
          <div class="loading-spinner"></div>
          <div class="loading-text">Loading...</div>
        </div>
      </div>
    }
  `,
  styles: `
    .route-loading-indicator {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      z-index: 9999;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .loading-overlay {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-color: rgba(255, 255, 255, 0.8);
      backdrop-filter: blur(2px);
    }

    .loading-content {
      position: relative;
      z-index: 1;
      padding: 24px;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 16px;
      min-width: 200px;
    }

    .loading-spinner {
      width: 40px;
      height: 40px;
      border: 3px solid #f3f3f3;
      border-top: 3px solid #1677ff;
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }

    .loading-text {
      font-size: 14px;
      color: #666;
      font-weight: 500;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RouteLoadingIndicatorComponent {
  readonly loadingService = inject(RouteLoadingService);
}