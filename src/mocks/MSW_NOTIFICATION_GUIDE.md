# MSW 通知 Mock 使用指南

## 概述

通知系统使用 MSW (Mock Service Worker) 来模拟后端 API，方便前端开发和测试。

## 启动 MSW

MSW 应该在应用启动时自动初始化。检查 `src/main.ts` 确保已导入：

```typescript
import './mocks/browser';
```

## API 端点

### 1. 获取通知列表

```typescript
// 请求
GET /api/notifications

// 响应
{
  "code": 0,
  "message": "success",
  "data": {
    "data": [
      {
        "id": "1",
        "title": "New Update Available",
        "message": "A new version of the platform is available...",
        "type": "info",
        "read": false,
        "timestamp": "2024-02-15T10:30:00.000Z"
      }
    ],
    "total": 12,
    "unreadCount": 5
  }
}
```

### 2. 标记为已读

```typescript
// 请求
POST /api/notifications/mark-read
{
  "notificationIds": ["1", "2", "3"]
}

// 响应
{
  "code": 0,
  "message": "success",
  "data": {
    "success": true,
    "message": "标记成功"
  }
}
```

### 3. 标记为未读

```typescript
// 请求
POST /api/notifications/mark-unread
{
  "notificationIds": ["1", "2"]
}
```

### 4. 全部标记为已读

```typescript
// 请求
POST /api/notifications/mark-all-read
{}
```

### 5. 删除通知

```typescript
// 请求
DELETE /api/notifications
{
  "notificationIds": ["1", "2"]
}
```

### 6. 清空所有通知

```typescript
// 请求
POST /api/notifications/clear-all
{}
```

### 7. 添加新通知（测试用）

```typescript
// 请求
POST /api/notifications
{
  "title": "Custom Notification",
  "message": "This is a test notification",
  "type": "info"
}
```

## 测试工具

### 在浏览器控制台中使用

```javascript
// 导入辅助函数（需要在开发模式下）
import { createTestNotification, addNotificationViaAPI } from './mocks/utils/notification-helper';

// 创建一个信息通知
addNotificationViaAPI({
  type: 'info',
  title: 'Test Notification',
  message: 'This is a test'
});

// 创建警告通知
addNotificationViaAPI({
  type: 'warning',
  title: 'Storage Warning',
  message: 'Disk usage at 85%'
});

// 创建错误通知
addNotificationViaAPI({
  type: 'error',
  title: 'Connection Failed',
  message: 'Cannot connect to database'
});

// 创建成功通知
addNotificationViaAPI({
  type: 'success',
  title: 'Backup Completed',
  message: 'All data backed up successfully'
});
```

### 使用预设场景

```javascript
import { addScenarioNotification } from './mocks/utils/notification-helper';

// 新用户注册场景
addScenarioNotification('newUserRegistered', 'john.doe@example.com');

// 系统警告场景
addScenarioNotification('systemWarning', 'High CPU usage detected');

// 错误发生场景
addScenarioNotification('errorOccurred', 'Database connection failed');

// 操作成功场景
addScenarioNotification('operationSuccess', 'Data export');

// 安全警报场景
addScenarioNotification('securityAlert', 'Multiple failed login attempts');

// 备份完成场景
addScenarioNotification('backupCompleted');

// 存储警告场景
addScenarioNotification('storageWarning', 85);
```

### 批量创建通知

```javascript
import { createMultipleNotifications } from './mocks/utils/notification-helper';

// 创建 10 个随机通知
const notifications = createMultipleNotifications(10);
notifications.forEach(n => addNotificationViaAPI(n));

// 创建特定类型的通知
const errorNotifications = createMultipleNotifications(5, ['error']);
errorNotifications.forEach(n => addNotificationViaAPI(n));
```

## 调试

### 查看 MSW 日志

MSW 会在控制台输出所有请求日志：

```
[MSW] GET /api/notifications - 返回通知列表
[MSW] POST /api/notifications/mark-read - 标记已读: ["1", "2"]
```

### 查看当前通知状态

在浏览器控制台执行：

```javascript
// 获取所有通知
fetch('/api/notifications')
  .then(r => r.json())
  .then(data => console.log('当前通知:', data.data.data));
```

### 重置通知数据

如果需要重置为初始状态，刷新页面即可。

## 测试场景示例

### 场景 1：测试未读徽章

```javascript
// 添加多个未读通知
for (let i = 0; i < 5; i++) {
  addNotificationViaAPI({
    type: 'info',
    title: `Unread Notification ${i + 1}`,
    message: 'This notification is unread'
  });
}

// 检查头部通知徽章是否显示 "5"
```

### 场景 2：测试通知筛选

```javascript
// 添加不同类型的通知
addNotificationViaAPI({ type: 'error', title: 'Error 1', message: '...' });
addNotificationViaAPI({ type: 'warning', title: 'Warning 1', message: '...' });
addNotificationViaAPI({ type: 'success', title: 'Success 1', message: '...' });

// 在通知中心页面测试类型筛选功能
```

### 场景 3：测试搜索功能

```javascript
// 添加包含特定关键词的通知
addNotificationViaAPI({
  type: 'info',
  title: 'Database Update',
  message: 'Database schema has been updated successfully'
});

// 在通知中心搜索 "database"，应该找到这条通知
```

### 场景 4：测试实时更新

```javascript
// 打开通知中心页面
// 然后在控制台执行：
addScenarioNotification('securityAlert', 'Suspicious activity detected');

// 应该立即在通知中心看到新通知（如果实现了轮询/WebSocket）
```

## Mock 数据位置

Mock 数据定义在：`src/mocks/handlers/notification.handlers.ts`

要修改初始通知数据，编辑 `mockNotifications` 数组。

## 常见问题

### Q: MSW 没有工作？

确保：
1. `src/main.ts` 中导入了 `./mocks/browser`
2. 没有真实的后端运行在相同端口
3. 检查浏览器控制台是否有 MSW 初始化日志

### Q: 通知没有更新？

MSW 的状态是单例的，在页面刷新前会保持状态。要重置，刷新页面。

### Q: 如何模拟网络错误？

修改 `notification.handlers.ts` 中的处理器：

```typescript
http.get('/api/notifications', () => {
  // 模拟网络错误
  return HttpResponse.json(
    { code: 500, message: 'Internal Server Error', data: null },
    { status: 500 }
  );
}),
```

## 与真实 API 集成

当后端 API 准备好时：

1. 在 `angular.json` 中配置生产构建排除 mock 文件
2. 或者使用环境变量控制 MSW 的启用

```typescript
if (!environment.production) {
  import('./mocks/browser');
}
```

## 相关文件

- MSW Handlers: `src/mocks/handlers/notification.handlers.ts`
- 辅助工具: `src/mocks/utils/notification-helper.ts`
- API 服务: `src/app/core/services/notification-api.service.ts`
- 通知服务: `src/app/services/notification.service.ts`
- API 文档: `src/app/services/NOTIFICATION_API.md`
