import { Component, inject, signal, computed, ChangeDetectionStrategy } from '@angular/core';
import { Router } from '@angular/router';
import { NzDropDownModule } from 'ng-zorro-antd/dropdown';
import { NzBadgeModule } from 'ng-zorro-antd/badge';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzListModule } from 'ng-zorro-antd/list';
import { NzEmptyModule } from 'ng-zorro-antd/empty';
import { NzMenuModule } from 'ng-zorro-antd/menu';
import { NzTooltipModule } from 'ng-zorro-antd/tooltip';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { TranslateModule } from '@ngx-translate/core';
import { NgClass } from '@angular/common';
import { NotificationService } from '../../services/notification.service';

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'error' | 'success';
  read: boolean;
  timestamp: Date;
}

@Component({
  selector: 'app-notification',
  imports: [
    NzDropDownModule,
    NzBadgeModule,
    NzIconModule,
    NzButtonModule,
    NzListModule,
    NzEmptyModule,
    NzMenuModule,
    NzTooltipModule,
    NzTagModule,
    TranslateModule,
    NgClass,
  ],
  templateUrl: './notification.html',
  styleUrl: './notification.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'app-notification',
  },
})
export class Notification {
  private router = inject(Router);
  private notificationService = inject(NotificationService);
  private readonly maxNotifications = 10;

  // 使用 computed 引用服务的 signal，保持响应性
  private serviceNotifications = this.notificationService.getAllNotificationsSignal();
  notifications = computed(() => {
    const value = this.serviceNotifications();
    return value || [];
  });
  loading = this.notificationService.loading;

  displayCount = signal(10);

  unreadCount = computed(() => {
    const notifs = this.notifications();
    return notifs.filter((n) => !n.read).length;
  });

  displayedNotifications = computed(() => {
    const notifs = this.notifications();
    return notifs.slice(0, this.displayCount());
  });

  hasMoreNotifications = computed(() => {
    const notifs = this.notifications();
    return notifs.length > this.displayCount();
  });

  constructor() {
    // 加载通知数据
    this.notificationService.loadNotifications();
  }

  markAsRead(notificationId: string): void {
    this.notificationService.markAsRead(notificationId);
  }

  markAllAsRead(): void {
    this.notificationService.markAllAsRead();
  }

  getNotificationIcon(type: NotificationItem['type']): string {
    const iconMap = {
      info: 'info-circle',
      warning: 'warning',
      error: 'close-circle',
      success: 'check-circle',
    };
    return iconMap[type] || 'info-circle';
  }

  getIconClass(type: NotificationItem['type']): string {
    const classMap = {
      info: 'notification-icon-info',
      warning: 'notification-icon-warning',
      error: 'notification-icon-error',
      success: 'notification-icon-success',
    };
    return classMap[type] || 'notification-icon-info';
  }

  getTagColor(type: NotificationItem['type']): string {
    const colorMap = {
      info: 'blue',
      warning: 'orange',
      error: 'red',
      success: 'green',
    };
    return colorMap[type] || 'default';
  }

  formatTimestamp(timestamp: Date | string): string {
    // 确保 timestamp 是 Date 对象
    const date = timestamp instanceof Date ? timestamp : new Date(timestamp);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInMins = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 24));

    if (diffInMins < 1) {
      return 'Just now';
    } else if (diffInMins < 60) {
      return `${diffInMins}m ago`;
    } else if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    } else if (diffInDays < 7) {
      return `${diffInDays}d ago`;
    } else {
      return date.toLocaleDateString();
    }
  }

  dismissNotification(event: Event, notificationId: string): void {
    event.stopPropagation();
    this.notificationService.deleteNotification(notificationId);
  }

  viewAllNotifications(): void {
    this.router.navigate(['/workbench/notification-center']);
  }
}
