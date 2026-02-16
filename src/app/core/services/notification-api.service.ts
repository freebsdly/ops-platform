import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, tap } from 'rxjs';
import { NotificationItem } from '../../layout/notification/notification';

export interface NotificationListResponse {
  data: NotificationItem[];
  total: number;
  unreadCount: number;
}

export interface MarkAsReadRequest {
  notificationIds: string[];
}

export interface MarkAsReadResponse {
  success: boolean;
  message?: string;
}

export interface DeleteNotificationRequest {
  notificationIds: string[];
}

export interface DeleteNotificationResponse {
  success: boolean;
  message?: string;
}

export interface ClearAllResponse {
  success: boolean;
  message?: string;
}

/**
 * 通知筛选参数
 */
export interface NotificationFilterParams {
  readStatus?: 'all' | 'read' | 'unread';
  type?: 'all' | 'info' | 'warning' | 'error' | 'success';
  search?: string;
  page?: number;
  pageSize?: number;
}

@Injectable({
  providedIn: 'root',
})
export class NotificationApiService {
  private http = inject(HttpClient);
  private readonly API_BASE_URL = '/api';

  /**
   * 获取所有通知（支持筛选）
   * 注意：apiResponseInterceptor 会自动解包 {code, message, data} 格式
   * 所以这里直接接收 NotificationListResponse 类型
   */
  getNotifications(filters?: NotificationFilterParams): Observable<NotificationListResponse> {
    console.log('NotificationApiService: 获取通知列表', filters);

    // 构建查询参数
    const params: Record<string, string> = {};

    if (filters?.readStatus && filters.readStatus !== 'all') {
      params['readStatus'] = filters.readStatus;
    }

    if (filters?.type && filters.type !== 'all') {
      params['type'] = filters.type;
    }

    if (filters?.search) {
      params['search'] = filters.search.trim();
    }

    if (filters?.page) {
      params['page'] = filters.page.toString();
    }

    if (filters?.pageSize) {
      params['pageSize'] = filters.pageSize.toString();
    }

    // 使用 URLSearchParams 构建查询字符串
    const queryString = new URLSearchParams(params).toString();
    const url = `${this.API_BASE_URL}/notifications${queryString ? `?${queryString}` : ''}`;

    return this.http.get<NotificationListResponse>(url).pipe(
      tap(response => {
        console.log('NotificationApiService: 原始响应:', response);
        console.log('NotificationApiService: 通知数组:', response.data);
        console.log('NotificationApiService: 获取到', response.total, '条通知');
      }),
      catchError(error => {
        console.error('NotificationApiService: 获取通知失败:', error);
        throw error;
      })
    );
  }

  /**
   * 标记通知为已读
   * 注意：apiResponseInterceptor 会自动解包
   */
  markAsRead(notificationIds: string[]): Observable<MarkAsReadResponse> {
    console.log('NotificationApiService: 标记通知为已读:', notificationIds);
    return this.http.post<MarkAsReadResponse>(`${this.API_BASE_URL}/notifications/mark-read`, {
      notificationIds
    }).pipe(
      tap(() => console.log('NotificationApiService: 标记成功')),
      catchError(error => {
        console.error('NotificationApiService: 标记已读失败:', error);
        throw error;
      })
    );
  }

  /**
   * 标记通知为未读
   * 注意：apiResponseInterceptor 会自动解包
   */
  markAsUnread(notificationIds: string[]): Observable<MarkAsReadResponse> {
    console.log('NotificationApiService: 标记通知为未读:', notificationIds);
    return this.http.post<MarkAsReadResponse>(`${this.API_BASE_URL}/notifications/mark-unread`, {
      notificationIds
    }).pipe(
      tap(() => console.log('NotificationApiService: 标记成功')),
      catchError(error => {
        console.error('NotificationApiService: 标记未读失败:', error);
        throw error;
      })
    );
  }

  /**
   * 全部标记为已读
   * 注意：apiResponseInterceptor 会自动解包
   */
  markAllAsRead(): Observable<MarkAsReadResponse> {
    console.log('NotificationApiService: 全部标记为已读');
    return this.http.post<MarkAsReadResponse>(`${this.API_BASE_URL}/notifications/mark-all-read`, {}).pipe(
      tap(() => console.log('NotificationApiService: 全部标记成功')),
      catchError(error => {
        console.error('NotificationApiService: 全部标记失败:', error);
        throw error;
      })
    );
  }

  /**
   * 删除通知
   * 注意：apiResponseInterceptor 会自动解包
   */
  deleteNotifications(notificationIds: string[]): Observable<DeleteNotificationResponse> {
    console.log('NotificationApiService: 删除通知:', notificationIds);
    return this.http.request<DeleteNotificationResponse>('delete', `${this.API_BASE_URL}/notifications`, {
      body: { notificationIds }
    }).pipe(
      tap(() => console.log('NotificationApiService: 删除成功')),
      catchError(error => {
        console.error('NotificationApiService: 删除失败:', error);
        throw error;
      })
    );
  }

  /**
   * 清空所有通知
   * 注意：apiResponseInterceptor 会自动解包
   */
  clearAll(): Observable<ClearAllResponse> {
    console.log('NotificationApiService: 清空所有通知');
    return this.http.post<ClearAllResponse>(`${this.API_BASE_URL}/notifications/clear-all`, {}).pipe(
      tap(() => console.log('NotificationApiService: 清空成功')),
      catchError(error => {
        console.error('NotificationApiService: 清空失败:', error);
        throw error;
      })
    );
  }
}
