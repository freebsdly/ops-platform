import {
  Component,
  ChangeDetectionStrategy,
  signal,
  computed,
  inject,
  effect,
  DestroyRef,
  ViewChild,
  ElementRef,
  AfterViewInit,
  OnDestroy,
} from '@angular/core';
import { Subscription } from 'rxjs';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { TranslateModule } from '@ngx-translate/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzDropdownModule, NzContextMenuService, NzDropdownMenuComponent } from 'ng-zorro-antd/dropdown';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzSpaceModule } from 'ng-zorro-antd/space';
import { NzMessageService } from 'ng-zorro-antd/message';
import { RouteConfigService } from '../../services/route-config.service';
import { StoreService } from '../../core/stores/store.service';

export interface TabItem {
  key: string;
  label: string;
  path: string;
  icon?: string;
  closable?: boolean;
}

@Component({
  selector: 'app-tabbar',
  imports: [TranslateModule, NzIconModule, NzDropdownModule, NzButtonModule, NzSpaceModule],
  templateUrl: './tabs.html',
  styleUrl: './tabs.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppTabBar {
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  private readonly routeConfigService = inject(RouteConfigService);
  private readonly contextMenuService = inject(NzContextMenuService);
  private readonly storeService = inject(StoreService);
  private readonly messageService = inject(NzMessageService);
  private readonly tabsStorageKey = 'app_tabs';

  @ViewChild('tabContainer') tabContainer!: ElementRef<HTMLDivElement>;
  @ViewChild('tabsWrapper') tabsWrapper!: ElementRef<HTMLDivElement>;

  private resizeObserver: ResizeObserver | null = null;
  private siderCollapsedSubscription: Subscription | null = null;
  private isViewInitialized = false;

  // Initialize tabs from localStorage or with default overview dashboard tab
  tabs = signal<TabItem[]>(this.loadTabsFromStorage());

  visibleTabs = computed(() => {
    const allTabs = this.tabs();
    return allTabs.slice(0, this.maxVisibleTabs());
  });

  overflowTabs = computed(() => {
    const allTabs = this.tabs();
    return allTabs.slice(this.maxVisibleTabs());
  });

  maxVisibleTabs = signal(10);

  selectedIndex = signal(this.loadSelectedIndexFromStorage());
  contextMenuIndex = signal(0);

  constructor() {
    // Monitor route changes to update active tab and add new tabs
    this.router.events
      .pipe(
        filter((event) => event instanceof NavigationEnd),
        takeUntilDestroyed()
      )
      .subscribe(() => {
        this.handleRouteChange();
      });

    // Monitor sider collapsed state changes
    this.siderCollapsedSubscription = this.storeService.isSiderCollapsed$.subscribe(() => {
      // When sider state changes, recalculate visible tabs after DOM updates
      requestAnimationFrame(() => {
        this.calculateVisibleTabs();
      });
    });

    // Save tabs to localStorage when they change
    effect(() => {
      const currentTabs = this.tabs();
      const currentIndex = this.selectedIndex();
      this.saveTabsToStorage(currentTabs, currentIndex);
    });

    // Initial tab update
    this.handleRouteChange();
  }

  ngAfterViewInit() {
    this.isViewInitialized = true;
    
    // Observe container size to adjust visible tabs
    this.resizeObserver = new ResizeObserver(() => {
      this.calculateVisibleTabs();
    });

    if (this.tabContainer) {
      this.resizeObserver.observe(this.tabContainer.nativeElement);
    }
    
    // Initial calculation
    this.calculateVisibleTabs();
  }

  ngOnDestroy() {
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }
    if (this.siderCollapsedSubscription) {
      this.siderCollapsedSubscription.unsubscribe();
    }
  }

  private calculateVisibleTabs(): void {
    // Wait for view to be initialized
    if (!this.isViewInitialized || !this.tabContainer || !this.tabsWrapper) {
      return;
    }

    const containerWidth = this.tabContainer.nativeElement.clientWidth;
    const tabWidth = 112; // 7rem = 112px
    const dropdownWidth = 32; // approx width for dropdown button
    const availableWidth = containerWidth - dropdownWidth;
    const maxTabs = Math.floor(availableWidth / tabWidth);

    this.maxVisibleTabs.set(Math.max(1, maxTabs));
  }

  private loadTabsFromStorage(): TabItem[] {
    try {
      const stored = localStorage.getItem(this.tabsStorageKey);
      if (stored) {
        const parsed = JSON.parse(stored);
        console.log(`[Tabs] Loading tabs from storage:`, parsed.tabs?.length || 0, 'tabs');
        // Ensure we always have at least the overview dashboard tab
        const tabs = parsed.tabs || [];
        
        // Convert old 'dashboard' or 'workbench' tabs to new 'CONFIG.OVERVIEW_DASHBOARD' tab
        const convertedTabs = tabs.map((tab: TabItem) => {
          if (tab.key === 'dashboard' || tab.key === 'workbench') {
            return {
              key: 'CONFIG.OVERVIEW_DASHBOARD',
              label: 'CONFIG.OVERVIEW_DASHBOARD',
              path: '/workbench/dashboard/overview',
              icon: 'dashboard',
              closable: false,
            };
          }
          return tab;
        });
        
        const hasOverviewDashboard = convertedTabs.some((tab: TabItem) => tab.key === 'CONFIG.OVERVIEW_DASHBOARD');

        if (!hasOverviewDashboard) {
          const result = [
            {
              key: 'CONFIG.OVERVIEW_DASHBOARD',
              label: 'CONFIG.OVERVIEW_DASHBOARD',
              path: '/workbench/dashboard/overview',
              icon: 'dashboard',
              closable: false,
            },
            ...convertedTabs,
          ];
          console.log(`[Tabs] No overview dashboard found, adding default. Total tabs:`, result.length);
          return result;
        }
        
        // Remove duplicate overview dashboard tabs
        const uniqueTabs = convertedTabs.filter((tab: TabItem, index: number, self: TabItem[]) =>
          index === self.findIndex((t: TabItem) => t.key === tab.key)
        );
        
        console.log(`[Tabs] After deduplication:`, uniqueTabs.length, 'unique tabs');
        console.log(`[Tabs] Tab keys:`, uniqueTabs.map((t: TabItem) => t.key));
        return uniqueTabs;
      }
    } catch (error) {
      console.error('[Tabs] Error loading tabs from storage:', error);
    }

    // Default tab if no storage or error
    console.log(`[Tabs] Using default tab`);
    return [
      {
        key: 'CONFIG.OVERVIEW_DASHBOARD',
        label: 'CONFIG.OVERVIEW_DASHBOARD',
        path: '/workbench/dashboard/overview',
        icon: 'dashboard',
        closable: false,
      },
    ];
  }

  private loadSelectedIndexFromStorage(): number {
    try {
      const stored = localStorage.getItem(this.tabsStorageKey);
      if (stored) {
        const parsed = JSON.parse(stored);
        return parsed.selectedIndex || 0;
      }
    } catch (error) {
      console.error('Error loading selected index from storage:', error);
    }
    return 0;
  }

  private saveTabsToStorage(tabs: TabItem[], selectedIndex: number): void {
    try {
      const data = {
        tabs: tabs,
        selectedIndex: selectedIndex,
      };
      localStorage.setItem(this.tabsStorageKey, JSON.stringify(data));
    } catch (error) {
      console.error('Error saving tabs to storage:', error);
    }
  }

  handleRouteChange(): void {
    const currentPath = this.router.url.split('?')[0];

    // Don't handle tabs for login route
    if (currentPath === '/login') {
      return;
    }

    // Don't handle tabs for root route - it's just a redirect
    if (currentPath === '/') {
      return;
    }

    const currentTab = this.tabs().find((tab) => tab.path === currentPath);

    // If we're at a new route that's not already a tab, add it
    if (!currentTab) {
      this.addTabFromRoute(currentPath);
    }

    // Update selected index
    const index = this.tabs().findIndex((tab) => tab.path === currentPath);
    if (index !== -1) {
      this.selectedIndex.set(index);
    }
  }

  addTabFromRoute(path: string): void {
    // Don't add tab for login route
    if (path === '/login') {
      return;
    }

    // Get tab configuration from unified service
    const tabConfig = this.routeConfigService.getTabConfig(path);

    // Check if a tab with the same key already exists
    const existingTabIndex = this.tabs().findIndex((tab) => tab.key === tabConfig.key);
    
    // Also check if a tab with the exact same path already exists
    const existingTabWithSamePath = this.tabs().findIndex((tab) => tab.path === path);

    if (existingTabWithSamePath !== -1) {
      // Tab with exact same path exists, just activate it
      this.selectedIndex.set(existingTabWithSamePath);
      return;
    }

    if (existingTabIndex === -1) {
      // Add new tab with unique key
      const newTab: TabItem = {
        key: tabConfig.key,
        label: tabConfig.label,
        path: path,
        icon: tabConfig.icon,
        closable: true,
      };

      const currentTabs = [...this.tabs(), newTab];
      this.tabs.set(currentTabs);
      this.selectedIndex.set(currentTabs.length - 1);
    } else {
      // Tab with same key exists but different path
      // Check if it's a default tab that should have a fixed path
      if (this.isDefaultTab(tabConfig.key)) {
        // For default tabs, update the existing tab's path if needed
        const updatedTabs = [...this.tabs()];
        updatedTabs[existingTabIndex] = {
          ...updatedTabs[existingTabIndex],
          path: path,
        };
        this.tabs.set(updatedTabs);
      } else {
        // For non-default tabs with same key but different path,
        // create a new tab with a unique key to avoid confusion
        const uniqueKey = `${tabConfig.key}-${Date.now()}`;
        const newTab: TabItem = {
          key: uniqueKey,
          label: tabConfig.label,
          path: path,
          icon: tabConfig.icon,
          closable: true,
        };

        const currentTabs = [...this.tabs(), newTab];
        this.tabs.set(currentTabs);
        this.selectedIndex.set(currentTabs.length - 1);
      }
    }
  }

  isDefaultTab(key: string): boolean {
    return ['CONFIG.OVERVIEW_DASHBOARD', 'dashboard', 'workbench'].includes(key);
  }

  isTabClosable(): boolean {
    const currentTab = this.tabs()[this.contextMenuIndex()];
    return currentTab ? currentTab.closable !== false : false;
  }

  isTabPinned(): boolean {
    const currentTab = this.tabs()[this.contextMenuIndex()];
    return currentTab ? currentTab.closable === false : false;
  }

  isTabDefault(): boolean {
    const currentTab = this.tabs()[this.contextMenuIndex()];
    return currentTab ? this.isDefaultTab(currentTab.key) : false;
  }

  onTabClick(index: number): void {
    console.log(`[Tabs] Tab clicked: index=${index}, path=${this.tabs()[index]?.path}`);
    this.selectedIndex.set(index);
    const tab = this.tabs()[index];
    if (tab && tab.path) {
      this.router.navigate([tab.path]);
    }
  }

  onOverflowTabClick(tab: TabItem): void {
    // Find the actual index in all tabs
    const index = this.tabs().findIndex((t) => t.key === tab.key);
    if (index !== -1) {
      this.onTabClick(index);
    }
  }

  closeTab(index: number, event?: MouseEvent): void {
    if (event) {
      event.stopPropagation();
    }

    const tab = this.tabs()[index];

    // Don't close if tab is marked as non-closable
    if (tab && tab.closable === false) {
      return;
    }

    const currentTabs = [...this.tabs()];
    currentTabs.splice(index, 1);
    this.tabs.set(currentTabs);

    const currentSelectedIndex = this.selectedIndex();

    // Update selected index if closed tab was before the selected tab
    if (index < currentSelectedIndex) {
      // Selected tab moves left
      this.selectedIndex.set(currentSelectedIndex - 1);
    } else if (index === currentSelectedIndex) {
      // Closed tab was active, navigate to next available tab or default
      if (currentTabs.length > 0) {
        const newIndex = Math.min(index, currentTabs.length - 1);
        this.selectedIndex.set(newIndex);
        this.router.navigate([currentTabs[newIndex].path]);
      } else {
        // Default to workbench if no tabs left
        this.router.navigate(['/workbench/dashboard/overview']);
      }
    }
    // If index > currentSelectedIndex, selected index stays the same
  }

  onTabContextMenu(index: number, event: MouseEvent, menu: NzDropdownMenuComponent): void {
    event.preventDefault();
    event.stopPropagation();
    this.contextMenuIndex.set(index);

    // Show the context menu using the service
    this.contextMenuService.create(event, menu);
  }

  // Tab Management Methods
  closeCurrentTab(): void {
    const currentIndex = this.contextMenuIndex();
    if (currentIndex >= 0 && currentIndex < this.tabs().length) {
      this.closeTab(currentIndex);
    }
  }

  closeOtherTabs(): void {
    const currentIndex = this.contextMenuIndex();
    const currentTab = this.tabs()[currentIndex];

    if (currentTab) {
      // Keep only the current tab and default tabs
      const defaultTabs = this.tabs().filter((tab) => this.isDefaultTab(tab.key));
      const newTabs = [...defaultTabs, currentTab];

      // Remove duplicates if current tab is already a default tab
      const uniqueTabs = newTabs.filter(
        (tab, index, self) => index === self.findIndex((t) => t.key === tab.key)
      );

      this.tabs.set(uniqueTabs);

      // Update selected index to the current tab's new position and navigate
      const newIndex = uniqueTabs.findIndex((tab) => tab.key === currentTab.key);
      if (newIndex !== -1) {
        this.selectedIndex.set(newIndex);
        // Navigate to the current tab's path
        this.router.navigate([currentTab.path]);
      }
    }
  }

  closeAllTabs(): void {
    // Keep only default tabs (workbench)
    const defaultTabs = this.tabs().filter((tab) => this.isDefaultTab(tab.key));
    this.tabs.set(defaultTabs);
    this.selectedIndex.set(0);

    // Navigate to workbench if not already there
    if (this.router.url !== '/workbench/dashboard/overview') {
      this.router.navigate(['/workbench/dashboard/overview']);
    }
  }

  reloadCurrentTab(): void {
    const currentTab = this.tabs()[this.contextMenuIndex()];
    if (currentTab && currentTab.path) {
      this.router.navigate([currentTab.path]).then(() => {
        // Force a hard reload of the component
        window.location.reload();
      });
    }
  }

  duplicateCurrentTab(): void {
    const currentIndex = this.contextMenuIndex();
    const currentTab = this.tabs()[currentIndex];

    if (currentTab && currentTab.closable !== false) {
      // Create a duplicate tab with a unique key
      const duplicateTab: TabItem = {
        ...currentTab,
        key: `${currentTab.key}-copy-${Date.now()}`,
      };

      const currentTabs = [...this.tabs(), duplicateTab];
      this.tabs.set(currentTabs);
      this.selectedIndex.set(currentTabs.length - 1);

      // Navigate to the duplicated tab's path
      this.router.navigate([duplicateTab.path]);
    }
  }

  pinCurrentTab(): void {
    const currentIndex = this.contextMenuIndex();
    const currentTab = this.tabs()[currentIndex];

    if (currentTab && currentTab.closable !== false) {
      // For now, we'll just make the tab non-closable (pinned)
      const updatedTabs = [...this.tabs()];
      updatedTabs[currentIndex] = {
        ...currentTab,
        closable: false,
      };

      this.tabs.set(updatedTabs);
    }
  }

  cleanupDuplicateTabs(): void {
    const currentTabs = this.tabs();
    console.log(`[Tabs] Before cleanup:`, currentTabs.length, 'tabs');
    console.log(`[Tabs] Tab keys before:`, currentTabs.map(t => t.key));
    
    // Remove duplicate tabs based on key
    const uniqueTabs = currentTabs.filter((tab, index, self) =>
      index === self.findIndex((t) => t.key === tab.key)
    );
    
    // Also ensure we don't have duplicate paths with different keys
    const finalTabs = uniqueTabs.filter((tab, index, self) =>
      index === self.findIndex((t) => t.path === tab.path)
    );
    
    console.log(`[Tabs] After cleanup:`, finalTabs.length, 'tabs');
    console.log(`[Tabs] Tab keys after:`, finalTabs.map(t => t.key));
    
    if (finalTabs.length < currentTabs.length) {
      this.tabs.set(finalTabs);
      this.messageService.success(`清理了 ${currentTabs.length - finalTabs.length} 个重复的标签页`);
      
      // Update selected index if needed
      const currentSelectedIndex = this.selectedIndex();
      const currentTab = currentTabs[currentSelectedIndex];
      if (currentTab) {
        const newIndex = finalTabs.findIndex(t => t.key === currentTab.key);
        if (newIndex !== -1 && newIndex !== currentSelectedIndex) {
          this.selectedIndex.set(newIndex);
        } else if (newIndex === -1 && finalTabs.length > 0) {
          // Selected tab was removed, select first tab
          this.selectedIndex.set(0);
          this.router.navigate([finalTabs[0].path]);
        }
      }
    } else {
      this.messageService.info('没有发现重复的标签页');
    }
  }
}
