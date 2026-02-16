import { http, HttpResponse } from 'msw';
import { NotificationItem } from '../../app/layout/notification/notification';

/**
 * 辅助函数：包装成功响应
 */
function wrapSuccessResponse<T>(data: T) {
  return {
    code: 0,
    message: 'success',
    data
  };
}

/**
 * 辅助函数：包装错误响应
 */
function wrapErrorResponse(code: number, message: string, status: number = 400) {
  return HttpResponse.json(
    {
      code,
      message,
      data: null
    },
    { status }
  );
}

/**
 * 解析查询参数
 */
function parseQueryParams(url: URL): {
  readStatus?: 'all' | 'read' | 'unread';
  type?: 'all' | 'info' | 'warning' | 'error' | 'success';
  search?: string;
  page?: number;
  pageSize?: number;
} {
  const params: any = {};

  const readStatus = url.searchParams.get('readStatus');
  if (readStatus) {
    params.readStatus = readStatus;
  }

  const type = url.searchParams.get('type');
  if (type) {
    params.type = type;
  }

  const search = url.searchParams.get('search');
  if (search) {
    params.search = search;
  }

  const page = url.searchParams.get('page');
  if (page) {
    params.page = parseInt(page, 10);
  }

  const pageSize = url.searchParams.get('pageSize');
  if (pageSize) {
    params.pageSize = parseInt(pageSize, 10);
  }

  return params;
}

/**
 * 模拟通知数据
 */
const mockNotifications: NotificationItem[] = [
  {
    id: '1',
    title: 'New Update Available',
    message: 'A new version of the platform is available with performance improvements and bug fixes.',
    type: 'info',
    read: false,
    timestamp: new Date(Date.now() - 1000 * 60 * 30),
  },
  {
    id: '2',
    title: 'System Maintenance',
    message: 'Scheduled maintenance will occur tonight at 2 AM UTC. Expected downtime: 30 minutes.',
    type: 'warning',
    read: false,
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
  },
  {
    id: '3',
    title: 'Alert Resolved',
    message: 'The CPU usage alert has been resolved. System performance is back to normal.',
    type: 'success',
    read: true,
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5),
  },
  {
    id: '4',
    title: 'New User Registered',
    message: 'User john.doe@example.com has joined the platform.',
    type: 'info',
    read: false,
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 8),
  },
  {
    id: '5',
    title: 'Storage Warning',
    message: 'Server storage is at 85% capacity. Consider expanding storage or cleaning up old data.',
    type: 'warning',
    read: true,
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 12),
  },
  {
    id: '6',
    title: 'Backup Completed',
    message: 'Daily backup has been completed successfully. All data is safe.',
    type: 'success',
    read: true,
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24),
  },
  {
    id: '7',
    title: 'Security Alert',
    message: 'Multiple failed login attempts detected from IP 192.168.1.100.',
    type: 'error',
    read: false,
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 36),
  },
  {
    id: '8',
    title: 'Feature Released',
    message: 'New dashboard customization features are now available.',
    type: 'info',
    read: true,
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 48),
  },
  {
    id: '9',
    title: 'Performance Update',
    message: 'System performance has been optimized. Page load times improved by 25%.',
    type: 'success',
    read: true,
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 72),
  },
  {
    id: '10',
    title: 'Report Ready',
    message: 'Your weekly report is ready for download.',
    type: 'info',
    read: false,
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 96),
  },
  {
    id: '11',
    title: 'Database Maintenance',
    message: 'Database optimization scheduled for this weekend.',
    type: 'warning',
    read: true,
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 120),
  },
  {
    id: '12',
    title: 'SSL Certificate Expiring',
    message: 'SSL certificate will expire in 30 days. Please renew soon.',
    type: 'error',
    read: false,
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 144),
  },
];

/**
 * 计算未读数量
 */
function calculateUnreadCount(): number {
  return mockNotifications.filter(n => !n.read).length;
}

/**
 * 通知处理器
 */
export const notificationHandlers = [
  /**
   * 获取通知列表（支持筛选）
   * GET /api/notifications
   * Query params: readStatus, type, search, page, pageSize
   */
  http.get('/api/notifications', ({ request }) => {
    const url = new URL(request.url);
    const filters = parseQueryParams(url);

    console.log('[MSW] GET /api/notifications - 筛选参数:', filters);

    // 应用筛选
    let filteredNotifications = [...mockNotifications];

    // 按读取状态筛选
    if (filters.readStatus === 'read') {
      filteredNotifications = filteredNotifications.filter(n => n.read);
    } else if (filters.readStatus === 'unread') {
      filteredNotifications = filteredNotifications.filter(n => !n.read);
    }

    // 按类型筛选
    if (filters.type && filters.type !== 'all') {
      filteredNotifications = filteredNotifications.filter(n => n.type === filters.type);
    }

    // 搜索筛选
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filteredNotifications = filteredNotifications.filter(n =>
        n.title.toLowerCase().includes(searchLower) ||
        n.message.toLowerCase().includes(searchLower) ||
        n.type.toLowerCase().includes(searchLower)
      );
    }

    // 分页
    const page = filters.page || 1;
    const pageSize = filters.pageSize || filteredNotifications.length;
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedNotifications = filteredNotifications.slice(startIndex, endIndex);

    console.log('[MSW] GET /api/notifications - 返回通知列表，筛选后:', filteredNotifications.length, '条');

    return HttpResponse.json(
      wrapSuccessResponse({
        data: paginatedNotifications,
        total: filteredNotifications.length,
        unreadCount: calculateUnreadCount(),
      })
    );
  }),

  /**
   * 标记为已读
   * POST /api/notifications/mark-read
   */
  http.post('/api/notifications/mark-read', async ({ request }) => {
    const { notificationIds } = await request.json() as { notificationIds: string[] };

    console.log('[MSW] POST /api/notifications/mark-read - 标记已读:', notificationIds);

    // 更新模拟数据
    notificationIds.forEach(id => {
      const notification = mockNotifications.find(n => n.id === id);
      if (notification) {
        notification.read = true;
      }
    });

    return HttpResponse.json(
      wrapSuccessResponse({
        success: true,
        message: '标记成功',
      })
    );
  }),

  /**
   * 标记为未读
   * POST /api/notifications/mark-unread
   */
  http.post('/api/notifications/mark-unread', async ({ request }) => {
    const { notificationIds } = await request.json() as { notificationIds: string[] };

    console.log('[MSW] POST /api/notifications/mark-unread - 标记未读:', notificationIds);

    // 更新模拟数据
    notificationIds.forEach(id => {
      const notification = mockNotifications.find(n => n.id === id);
      if (notification) {
        notification.read = false;
      }
    });

    return HttpResponse.json(
      wrapSuccessResponse({
        success: true,
        message: '标记成功',
      })
    );
  }),

  /**
   * 全部标记为已读
   * POST /api/notifications/mark-all-read
   */
  http.post('/api/notifications/mark-all-read', () => {
    console.log('[MSW] POST /api/notifications/mark-all-read - 全部标记已读');

    // 更新所有通知
    mockNotifications.forEach(n => {
      n.read = true;
    });

    return HttpResponse.json(
      wrapSuccessResponse({
        success: true,
        message: '全部标记成功',
      })
    );
  }),

  /**
   * 删除通知
   * DELETE /api/notifications
   */
  http.delete('/api/notifications', async ({ request }) => {
    const { notificationIds } = await request.json() as { notificationIds: string[] };

    console.log('[MSW] DELETE /api/notifications - 删除通知:', notificationIds);

    // 从模拟数据中删除
    notificationIds.forEach(id => {
      const index = mockNotifications.findIndex(n => n.id === id);
      if (index !== -1) {
        mockNotifications.splice(index, 1);
      }
    });

    return HttpResponse.json(
      wrapSuccessResponse({
        success: true,
        message: '删除成功',
      })
    );
  }),

  /**
   * 清空所有通知
   * POST /api/notifications/clear-all
   */
  http.post('/api/notifications/clear-all', () => {
    console.log('[MSW] POST /api/notifications/clear-all - 清空所有通知');

    // 清空数组
    mockNotifications.length = 0;

    return HttpResponse.json(
      wrapSuccessResponse({
        success: true,
        message: '清空成功',
      })
    );
  }),

  /**
   * 添加新通知（用于测试，可选）
   * POST /api/notifications
   */
  http.post('/api/notifications', async ({ request }) => {
    const newNotification = await request.json() as Partial<NotificationItem>;

    console.log('[MSW] POST /api/notifications - 添加新通知:', newNotification);

    const notification: NotificationItem = {
      id: Date.now().toString(),
      title: newNotification.title || 'New Notification',
      message: newNotification.message || '',
      type: newNotification.type || 'info',
      read: false,
      timestamp: new Date(),
    };

    // 添加到数组开头
    mockNotifications.unshift(notification);

    return HttpResponse.json(
      wrapSuccessResponse({
        notification,
        total: mockNotifications.length,
        unreadCount: calculateUnreadCount(),
      })
    );
  }),
];
