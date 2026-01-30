import { Injectable, signal } from '@angular/core';
import { NavigationCancel, NavigationEnd, NavigationError, NavigationStart, Router, Event } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class RouteLoadingService {
  private readonly isLoading = signal<boolean>(false);
  private loadingCount = 0;

  // Public read-only signal
  readonly loading = this.isLoading.asReadonly();

  constructor(private router: Router) {
    this.setupRouterEvents();
  }

  private setupRouterEvents(): void {
    this.router.events.subscribe((event: Event) => {
      if (event instanceof NavigationStart) {
        this.startLoading();
      }

      if (
        event instanceof NavigationEnd ||
        event instanceof NavigationCancel ||
        event instanceof NavigationError
      ) {
        // Small delay to prevent flicker for fast route changes
        setTimeout(() => {
          this.endLoading();
        }, 50);
      }
    });
  }

  /**
   * Start loading state
   */
  private startLoading(): void {
    this.loadingCount++;
    if (this.loadingCount === 1) {
      this.isLoading.set(true);
    }
  }

  /**
   * End loading state
   */
  private endLoading(): void {
    if (this.loadingCount > 0) {
      this.loadingCount--;
    }
    
    if (this.loadingCount === 0) {
      this.isLoading.set(false);
    }
  }

  /**
   * Manually set loading state
   */
  setLoading(state: boolean): void {
    if (state) {
      this.loadingCount++;
      this.isLoading.set(true);
    } else {
      this.endLoading();
    }
  }

  /**
   * Get current loading state
   */
  getLoading(): boolean {
    return this.loading();
  }

  /**
   * Manually start loading for async operations
   */
  startManualLoading(): void {
    this.startLoading();
  }

  /**
   * Manually end loading for async operations
   */
  endManualLoading(): void {
    this.endLoading();
  }

  /**
   * Wrap an async operation with loading state
   */
  async withLoading<T>(operation: () => Promise<T>): Promise<T> {
    this.startManualLoading();
    try {
      return await operation();
    } finally {
      this.endManualLoading();
    }
  }

  /**
   * Check if currently loading
   */
  isLoadingNow(): boolean {
    return this.loadingCount > 0;
  }

  /**
   * Reset loading state (use with caution)
   */
  resetLoading(): void {
    this.loadingCount = 0;
    this.isLoading.set(false);
  }
}