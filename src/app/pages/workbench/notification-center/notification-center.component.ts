import { Component, inject, signal, computed, ChangeDetectionStrategy, OnInit, effect, untracked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzListModule } from 'ng-zorro-antd/list';
import { NzEmptyModule } from 'ng-zorro-antd/empty';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzDropDownModule } from 'ng-zorro-antd/dropdown';
import { NzMenuModule } from 'ng-zorro-antd/menu';
import { NzTooltipModule } from 'ng-zorro-antd/tooltip';
import { NzRadioModule } from 'ng-zorro-antd/radio';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { TranslateModule } from '@ngx-translate/core';
import { NotificationItem } from '../../../layout/notification/notification';
import { NotificationService, NotificationFilterParams } from '../../../services/notification.service';

@Component({
  selector: 'app-notification-center',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NzCardModule,
    NzListModule,
    NzEmptyModule,
    NzButtonModule,
    NzTagModule,
    NzIconModule,
    NzDropDownModule,
    NzMenuModule,
    NzTooltipModule,
    NzRadioModule,
    NzSelectModule,
    NzInputModule,
    NzSpinModule,
    TranslateModule,
  ],
  templateUrl: './notification-center.component.html',
  styleUrl: './notification-center.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NotificationCenterComponent implements OnInit {
  private router = inject(Router);
  private notificationService = inject(NotificationService);

  // 使用共享服务的数据（通过 API 筛选后的数据）
  private allNotificationsSignal = this.notificationService.getAllNotificationsSignal();
  filteredNotifications = computed(() => {
    const value = this.allNotificationsSignal();
    return value || [];
  });
  loading = this.notificationService.loading;
  error = this.notificationService.error;

  // 筛选类型
  filterType = signal<'all' | 'unread' | 'read'>('all');

  // 通知类型筛选
  notificationTypeFilter = signal<'all' | 'info' | 'warning' | 'error' | 'success'>('all');

  // 搜索查询
  searchQuery = signal('');

  // 防抖的搜索查询
  debouncedSearchQuery = signal('');

  // 统计信息（基于筛选后的数据）
  totalCount = computed(() => this.filteredNotifications().length);
  unreadCount = computed(() => this.filteredNotifications().filter((n) => !n.read).length);

  // 计算各类型通知数量（基于筛选后的数据）
  typeCounts = computed(() => {
    const notifications = this.filteredNotifications();
    return {
      all: notifications.length,
      info: notifications.filter((n) => n.type === 'info').length,
      warning: notifications.filter((n) => n.type === 'warning').length,
      error: notifications.filter((n) => n.type === 'error').length,
      success: notifications.filter((n) => n.type === 'success').length,
    };
  });

  // 搜索防抖定时器
  private searchDebounceTimer: any = null;

  // 标记是否已经初始化
  private isInitialized = false;

  constructor() {
    // 监听筛选条件变化，自动重新加载数据
    effect(() => {
      // 跳过首次运行（ngOnInit 会处理）
      if (!this.isInitialized) {
        return;
      }

      const filters = this.buildFilterParams();
      console.log('NotificationCenterComponent: 筛选条件变化，重新加载数据', filters);
      // 使用 untracked 避免追踪 loading 和 notificationsSignal 的变化，防止无限循环
      untracked(() => {
        this.notificationService.loadFilteredNotifications(filters);
      });
    });
  }

  ngOnInit(): void {
    // 首次加载所有通知（不带筛选）
    this.isInitialized = true;
    const filters = this.buildFilterParams();
    this.notificationService.loadFilteredNotifications(filters);
  }

  /**
   * 构建筛选参数
   */
  private buildFilterParams(): NotificationFilterParams {
    const params: NotificationFilterParams = {};

    // 读取状态筛选
    if (this.filterType() !== 'all') {
      params.readStatus = this.filterType() === 'read' ? 'read' : 'unread';
    }

    // 类型筛选
    if (this.notificationTypeFilter() !== 'all') {
      params.type = this.notificationTypeFilter();
    }

    // 搜索筛选（使用防抖后的值）
    if (this.debouncedSearchQuery()) {
      params.search = this.debouncedSearchQuery();
    }

    return params;
  }

  /**
   * 搜索输入变化（带防抖）
   */
  onSearchInput(query: string): void {
    this.searchQuery.set(query);

    // 清除之前的定时器
    if (this.searchDebounceTimer) {
      clearTimeout(this.searchDebounceTimer);
    }

    // 设置新的防抖定时器
    this.searchDebounceTimer = setTimeout(() => {
      this.debouncedSearchQuery.set(query.trim());
    }, 300);
  }

  // 获取通知图标
  getNotificationIcon(type: NotificationItem['type']): string {
    const iconMap = {
      info: 'info-circle',
      warning: 'warning',
      error: 'close-circle',
      success: 'check-circle',
    };
    return iconMap[type] || 'info-circle';
  }

  // 获取图标样式类
  getIconClass(type: NotificationItem['type']): string {
    const classMap = {
      info: 'notification-icon-info',
      warning: 'notification-icon-warning',
      error: 'notification-icon-error',
      success: 'notification-icon-success',
    };
    return classMap[type] || 'notification-icon-info';
  }

  // 获取标签颜色
  getTagColor(type: NotificationItem['type']): string {
    const colorMap = {
      info: 'blue',
      warning: 'orange',
      error: 'red',
      success: 'green',
    };
    return colorMap[type] || 'default';
  }

  // 格式化时间戳 - 返回包含翻译键和值的对象
  formatTimestamp(timestamp: Date | string): { key: string; value?: number } {
    // 确保 timestamp 是 Date 对象
    const date = timestamp instanceof Date ? timestamp : new Date(timestamp);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInMins = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInMins < 1) {
      return { key: 'NOTIFICATION.JUST_NOW' };
    } else if (diffInMins < 60) {
      return { key: 'NOTIFICATION.MINUTES_AGO', value: diffInMins };
    } else if (diffInHours < 24) {
      return { key: 'NOTIFICATION.HOURS_AGO', value: diffInHours };
    } else if (diffInDays < 7) {
      return { key: 'NOTIFICATION.DAYS_AGO', value: diffInDays };
    } else {
      return { key: date.toLocaleDateString() };
    }
  }

  // 标记为已读
  markAsRead(notificationId: string): void {
    this.notificationService.markAsRead(notificationId);
  }

  // 标记为未读
  markAsUnread(notificationId: string): void {
    this.notificationService.markAsUnread(notificationId);
  }

  // 删除通知
  deleteNotification(event: Event, notificationId: string): void {
    event.stopPropagation();
    this.notificationService.deleteNotification(notificationId);
  }

  // 全部标记为已读
  markAllAsRead(): void {
    this.notificationService.markAllAsRead();
  }

  // 清空所有通知
  clearAll(): void {
    if (confirm('Are you sure you want to clear all notifications?')) {
      this.notificationService.clearAll();
    }
  }

  // 设置筛选类型
  setFilterType(type: 'all' | 'unread' | 'read'): void {
    this.filterType.set(type);
  }

  // 设置通知类型筛选
  setNotificationTypeFilter(type: 'all' | 'info' | 'warning' | 'error' | 'success'): void {
    this.notificationTypeFilter.set(type);
  }

  // 返回上一页
  goBack(): void {
    this.router.navigate(['/workbench']);
  }

  // 刷新通知列表
  refresh(): void {
    this.notificationService.refresh();
  }
}
