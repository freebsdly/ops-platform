import { Component, signal, viewChild, ElementRef, inject, afterNextRender } from '@angular/core';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzRadioModule } from 'ng-zorro-antd/radio';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-search',
  imports: [
    NzIconModule, 
    NzButtonModule,
    NzRadioModule,
    NzSelectModule,
    FormsModule, 
    TranslateModule
  ],
  templateUrl: './search.html',
  styleUrl: './search.css',
})
export class Search {
  isDialogVisible = signal(false);
  quickSearchQuery = signal('');
  searchType = signal('all');
  timeRange = signal('all');
  keywords = signal('');
  selectedTags = signal<string[]>([]);
  
  private quickSearchInput = viewChild<ElementRef>('quickSearchInput');

  // 模拟可用的标签
  availableTags = signal([
    'urgent',
    'documentation',
    'bug',
    'feature',
    'enhancement',
    'design',
    'backend',
    'frontend'
  ]);

  constructor() {
    afterNextRender(() => {
      // 点击外部关闭对话框
      document.addEventListener('click', this.handleDocumentClick.bind(this));
    });
  }

  openSearchDialog(): void {
    this.isDialogVisible.set(true);
    // 延迟聚焦快速搜索输入框
    setTimeout(() => {
      const input = this.quickSearchInput()?.nativeElement;
      if (input) {
        input.focus();
      }
    }, 100);
  }

  closeSearchDialog(): void {
    this.isDialogVisible.set(false);
  }

  onQuickSearch(): void {
    const query = this.quickSearchQuery();
    if (query.trim()) {
      console.log('Quick searching for:', query);
      this.performSearch({
        query,
        type: 'quick',
        searchType: this.searchType(),
        timeRange: this.timeRange(),
        keywords: this.keywords(),
        tags: this.selectedTags()
      });
      this.closeSearchDialog();
    }
  }

  onAdvancedSearch(): void {
    const searchParams = {
      query: this.quickSearchQuery(),
      type: 'advanced',
      searchType: this.searchType(),
      timeRange: this.timeRange(),
      keywords: this.keywords(),
      tags: this.selectedTags()
    };
    
    console.log('Advanced search with params:', searchParams);
    this.performSearch(searchParams);
    this.closeSearchDialog();
  }

  private performSearch(params: any): void {
    // 这里可以添加实际的搜索逻辑
    // 例如：this.storeService.search(params);
    console.log('Performing search:', params);
    
    // 重置表单
    this.quickSearchQuery.set('');
    this.searchType.set('all');
    this.timeRange.set('all');
    this.keywords.set('');
    this.selectedTags.set([]);
  }

  handleDocumentClick(event: MouseEvent): void {
    if (!this.isDialogVisible()) return;
    
    const dialog = document.querySelector('.search-dialog');
    const trigger = document.querySelector('.search-input-wrapper');
    const target = event.target as HTMLElement;
    
    if (dialog && !dialog.contains(target) && trigger && !trigger.contains(target)) {
      this.closeSearchDialog();
    }
  }
}
