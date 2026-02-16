/**
 * MSW 通知工具函数
 * 用于测试和模拟通知场景
 */

import { NotificationItem } from '../../app/layout/notification/notification';

export type NotificationType = 'info' | 'warning' | 'error' | 'success';

/**
 * 生成随机通知 ID
 */
export function generateNotificationId(): string {
  return `notification_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * 创建测试通知
 */
export function createTestNotification(
  type: NotificationType,
  title?: string,
  message?: string
): NotificationItem {
  const now = Date.now();

  const titles: Record<NotificationType, string> = {
    info: title || 'New Information',
    warning: title || 'Warning Alert',
    error: title || 'Error Occurred',
    success: title || 'Operation Successful',
  };

  const messages: Record<NotificationType, string> = {
    info: message || 'This is an informational notification for testing purposes.',
    warning: message || 'This is a warning that requires your attention.',
    error: message || 'An error has occurred. Please check the system logs.',
    success: message || 'The operation was completed successfully.',
  };

  return {
    id: generateNotificationId(),
    title: titles[type],
    message: messages[type],
    type,
    read: false,
    timestamp: new Date(now),
  };
}

/**
 * 批量创建测试通知
 */
export function createMultipleNotifications(
  count: number,
  types?: NotificationType[]
): NotificationItem[] {
  const notifications: NotificationItem[] = [];
  const defaultTypes: NotificationType[] = ['info', 'warning', 'error', 'success'];

  const typePool = types || defaultTypes;

  for (let i = 0; i < count; i++) {
    const type = typePool[Math.floor(Math.random() * typePool.length)];
    const notification = createTestNotification(
      type,
      `Test Notification ${i + 1}`,
      `This is test notification number ${i + 1} for testing purposes.`
    );

    // 错开时间
    const timeOffset = i * 60 * 1000; // 每个通知间隔 1 分钟
    notification.timestamp = new Date(Date.now() - timeOffset);

    notifications.push(notification);
  }

  return notifications.reverse(); // 最新的在前
}

/**
 * 添加通知到 MSW（通过 fetch）
 */
export async function addNotificationViaAPI(notification: Partial<NotificationItem>): Promise<void> {
  try {
    await fetch('/api/notifications', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(notification),
    });
    console.log('[MSW] 通知已添加:', notification);
  } catch (error) {
    console.error('[MSW] 添加通知失败:', error);
  }
}

/**
 * 示例场景预定义
 */
export const NotificationScenarios = {
  /**
   * 场景：新用户注册
   */
  newUserRegistered: (username: string) => ({
    type: 'info' as NotificationType,
    title: 'New User Registered',
    message: `User ${username} has joined the platform.`,
  }),

  /**
   * 场景：系统警告
   */
  systemWarning: (warning: string) => ({
    type: 'warning' as NotificationType,
    title: 'System Warning',
    message: warning,
  }),

  /**
   * 场景：错误发生
   */
  errorOccurred: (error: string) => ({
    type: 'error' as NotificationType,
    title: 'Error Detected',
    message: error,
  }),

  /**
   * 场景：操作成功
   */
  operationSuccess: (operation: string) => ({
    type: 'success' as NotificationType,
    title: 'Operation Successful',
    message: `${operation} completed successfully.`,
  }),

  /**
   * 场景：安全警报
   */
  securityAlert: (alert: string) => ({
    type: 'error' as NotificationType,
    title: 'Security Alert',
    message: alert,
  }),

  /**
   * 场景：备份完成
   */
  backupCompleted: () => ({
    type: 'success' as NotificationType,
    title: 'Backup Completed',
    message: 'Daily backup has been completed successfully. All data is safe.',
  }),

  /**
   * 场景：存储警告
   */
  storageWarning: (percentage: number) => ({
    type: 'warning' as NotificationType,
    title: 'Storage Warning',
    message: `Server storage is at ${percentage}% capacity. Consider expanding storage or cleaning up old data.`,
  }),
};

/**
 * 快速添加预设场景通知
 */
export async function addScenarioNotification(
  scenarioName: keyof typeof NotificationScenarios,
  ...args: any[]
): Promise<void> {
  const scenario = NotificationScenarios[scenarioName];
  if (scenario) {
    // @ts-ignore - 场景函数的参数类型是动态的
    const notificationData = scenario(...args);
    await addNotificationViaAPI(notificationData);
  }
}
