import { Component, signal, viewChild, ElementRef, inject, afterNextRender } from '@angular/core';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-search',
  imports: [NzIconModule, FormsModule, TranslateModule],
  templateUrl: './search.html',
  styleUrl: './search.css',
})
export class Search {
  isExpanded = signal(false);
  searchQuery = signal('');
  
  private searchInput = viewChild<ElementRef>('searchInput');

  constructor() {
    afterNextRender(() => {
      // 点击外部关闭搜索框
      document.addEventListener('click', this.handleDocumentClick.bind(this));
    });
  }

  expandSearch(): void {
    this.isExpanded.set(true);
    // 延迟聚焦输入框，确保DOM已更新
    setTimeout(() => {
      const input = this.searchInput()?.nativeElement;
      if (input) {
        input.focus();
      }
    }, 0);
  }

  collapseSearch(): void {
    if (this.isExpanded()) {
      this.isExpanded.set(false);
      this.searchQuery.set('');
    }
  }

  onSearch(): void {
    const query = this.searchQuery();
    if (query.trim()) {
      console.log('Searching for:', query);
      // 这里可以添加实际的搜索逻辑
      // 例如：this.storeService.search(query);
    }
    // 搜索后保持展开状态，用户可以继续搜索
  }

  onBlur(): void {
    // 只有输入框为空时才自动收起
    if (!this.searchQuery().trim()) {
      setTimeout(() => {
        this.collapseSearch();
      }, 200);
    }
  }

  handleDocumentClick(event: MouseEvent): void {
    const searchContainer = document.querySelector('.search-container');
    const target = event.target as HTMLElement;
    
    if (searchContainer && !searchContainer.contains(target) && this.isExpanded()) {
      this.collapseSearch();
    }
  }
}
