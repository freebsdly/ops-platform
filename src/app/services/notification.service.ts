import { Injectable, inject, signal, computed } from '@angular/core';
import { NotificationApiService, NotificationFilterParams } from '../core/services/notification-api.service';
import { NotificationItem } from '../layout/notification/notification';
import { Observable, BehaviorSubject, switchMap, tap, catchError, of, finalize } from 'rxjs';

// Re-export types for convenience
export type { NotificationFilterParams };

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  private notificationApiService = inject(NotificationApiService);

  // 加载状态
  loading = signal<boolean>(false);
  error = signal<string | null>(null);

  // 通知数据
  private notificationsSubject = new BehaviorSubject<NotificationItem[]>([]);
  notifications = this.notificationsSubject.asObservable();

  // Signal 版本的通知列表（用于组件中使用）
  notificationsSignal = signal<NotificationItem[]>([]);

  // 标记是否已经加载过数据
  private isDataLoaded = false;

  // 统计信息
  totalCount = computed(() => this.notificationsSignal().length);
  unreadCount = computed(() => this.notificationsSignal().filter(n => !n.read).length);

  // 各类型统计
  typeCounts = computed(() => {
    const notifications = this.notificationsSignal();
    return {
      all: notifications.length,
      info: notifications.filter(n => n.type === 'info').length,
      warning: notifications.filter(n => n.type === 'warning').length,
      error: notifications.filter(n => n.type === 'error').length,
      success: notifications.filter(n => n.type === 'success').length,
    };
  });

  /**
   * 确保通知数据中的 timestamp 是 Date 对象
   * HTTP 传输会将 Date 序列化为字符串，需要转换回来
   */
  private normalizeNotificationData(notifications: NotificationItem[]): NotificationItem[] {
    return notifications.map(notification => ({
      ...notification,
      timestamp: notification.timestamp instanceof Date
        ? notification.timestamp
        : new Date(notification.timestamp)
    }));
  }

  /**
   * 加载所有通知
   * @param forceReload 是否强制重新加载（默认为 false，已加载则跳过）
   */
  loadNotifications(forceReload: boolean = false): void {
    // 如果已经加载过数据且不强制刷新，则跳过
    if (this.isDataLoaded && !forceReload) {
      console.log('NotificationService: 数据已加载，跳过重复请求');
      return;
    }

    // 如果正在加载，也跳过避免重复请求
    if (this.loading()) {
      console.log('NotificationService: 正在加载中，跳过重复请求');
      return;
    }

    this.loading.set(true);
    this.error.set(null);

    this.notificationApiService.getNotifications().pipe(
      tap(response => {
        console.log('NotificationService: 加载通知成功', response);
        // 确保 timestamp 是 Date 对象
        const normalizedData = this.normalizeNotificationData(response.data);
        this.notificationsSignal.set(normalizedData);
        this.notificationsSubject.next(normalizedData);
        // 标记数据已加载
        this.isDataLoaded = true;
      }),
      catchError(error => {
        console.error('NotificationService: 加载通知失败', error);
        this.error.set('加载通知失败，请稍后重试');
        // 保持现有数据不变
        return of();
      }),
      finalize(() => {
        this.loading.set(false);
      })
    ).subscribe();
  }

  /**
   * 加载筛选后的通知（通过 API 筛选）
   * @param filters 筛选参数
   */
  loadFilteredNotifications(filters: NotificationFilterParams): void {
    // 如果正在加载，跳过避免重复请求
    if (this.loading()) {
      console.log('NotificationService: 正在加载中，跳过重复请求');
      return;
    }

    this.loading.set(true);
    this.error.set(null);

    this.notificationApiService.getNotifications(filters).pipe(
      tap(response => {
        console.log('NotificationService: 加载筛选通知成功', response);
        // 确保 timestamp 是 Date 对象
        const normalizedData = this.normalizeNotificationData(response.data);
        this.notificationsSignal.set(normalizedData);
        this.notificationsSubject.next(normalizedData);
      }),
      catchError(error => {
        console.error('NotificationService: 加载筛选通知失败', error);
        this.error.set('加载通知失败，请稍后重试');
        // 保持现有数据不变
        return of();
      }),
      finalize(() => {
        this.loading.set(false);
      })
    ).subscribe();
  }

  /**
   * 获取所有通知（Observable 版本）
   */
  getAllNotifications() {
    return this.notifications;
  }

  /**
   * 获取所有通知（Signal 版本）
   */
  getAllNotificationsSignal() {
    return this.notificationsSignal;
  }

  /**
   * 更新通知列表
   */
  updateNotifications(notifications: NotificationItem[]) {
    // 确保 timestamp 是 Date 对象
    const normalizedData = this.normalizeNotificationData(notifications);
    this.notificationsSignal.set(normalizedData);
    this.notificationsSubject.next(normalizedData);
  }

  /**
   * 标记为已读
   */
  markAsRead(notificationId: string): void {
    const currentNotifications = this.notificationsSignal();
    const notification = currentNotifications.find(n => n.id === notificationId);

    if (notification && !notification.read) {
      // 乐观更新 UI
      const updatedNotifications = currentNotifications.map(n =>
        n.id === notificationId ? { ...n, read: true } : n
      );
      this.updateNotifications(updatedNotifications);

      // 调用 API
      this.notificationApiService.markAsRead([notificationId]).pipe(
        catchError(error => {
          console.error('NotificationService: 标记已读失败，回滚', error);
          // 回滚更新
          this.updateNotifications(currentNotifications);
          return of();
        })
      ).subscribe();
    }
  }

  /**
   * 标记为未读
   */
  markAsUnread(notificationId: string): void {
    const currentNotifications = this.notificationsSignal();
    const notification = currentNotifications.find(n => n.id === notificationId);

    if (notification && notification.read) {
      // 乐观更新 UI
      const updatedNotifications = currentNotifications.map(n =>
        n.id === notificationId ? { ...n, read: false } : n
      );
      this.updateNotifications(updatedNotifications);

      // 调用 API
      this.notificationApiService.markAsUnread([notificationId]).pipe(
        catchError(error => {
          console.error('NotificationService: 标记未读失败，回滚', error);
          // 回滚更新
          this.updateNotifications(currentNotifications);
          return of();
        })
      ).subscribe();
    }
  }

  /**
   * 全部标记为已读
   */
  markAllAsRead(): void {
    const currentNotifications = this.notificationsSignal();

    // 乐观更新 UI
    const updatedNotifications = currentNotifications.map(n => ({ ...n, read: true }));
    this.updateNotifications(updatedNotifications);

    // 调用 API
    this.notificationApiService.markAllAsRead().pipe(
      catchError(error => {
        console.error('NotificationService: 全部标记已读失败，回滚', error);
        // 回滚更新
        this.updateNotifications(currentNotifications);
        return of();
      })
    ).subscribe();
  }

  /**
   * 删除通知
   */
  deleteNotification(notificationId: string): void {
    const currentNotifications = this.notificationsSignal();

    // 乐观更新 UI
    const updatedNotifications = currentNotifications.filter(n => n.id !== notificationId);
    this.updateNotifications(updatedNotifications);

    // 调用 API
    this.notificationApiService.deleteNotifications([notificationId]).pipe(
      catchError(error => {
        console.error('NotificationService: 删除通知失败，回滚', error);
        // 回滚更新
        this.updateNotifications(currentNotifications);
        return of();
      })
    ).subscribe();
  }

  /**
   * 清空所有通知
   */
  clearAll(): void {
    const currentNotifications = this.notificationsSignal();

    // 乐观更新 UI
    this.updateNotifications([]);

    // 调用 API
    this.notificationApiService.clearAll().pipe(
      catchError(error => {
        console.error('NotificationService: 清空通知失败，回滚', error);
        // 回滚更新
        this.updateNotifications(currentNotifications);
        return of();
      })
    ).subscribe();
  }

  /**
   * 刷新通知列表（强制重新加载）
   */
  refresh(): void {
    this.isDataLoaded = false; // 重置加载标志
    this.loadNotifications(true);
  }
}
