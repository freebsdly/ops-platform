# 通知系统 API 接口文档

## 基础信息

- **Base URL**: `/api`
- **Content-Type**: `application/json`

## 接口列表

### 1. 获取通知列表

**接口**: `GET /api/notifications`

**响应**:
```json
{
  "data": [
    {
      "id": "1",
      "title": "New Update Available",
      "message": "A new version of the platform is available with performance improvements and bug fixes.",
      "type": "info",
      "read": false,
      "timestamp": "2024-02-15T10:30:00Z"
    }
  ],
  "total": 12,
  "unreadCount": 5
}
```

**字段说明**:
- `id`: 通知唯一标识符 (string)
- `title`: 通知标题 (string)
- `message`: 通知内容 (string)
- `type`: 通知类型，可选值: `info` | `warning` | `error` | `success`
- `read`: 是否已读 (boolean)
- `timestamp`: ISO 8601 格式时间戳 (string)
- `total`: 通知总数 (number)
- `unreadCount`: 未读数量 (number)

---

### 2. 标记为已读

**接口**: `POST /api/notifications/mark-read`

**请求体**:
```json
{
  "notificationIds": ["1", "2", "3"]
}
```

**响应**:
```json
{
  "success": true,
  "message": "标记成功"
}
```

---

### 3. 标记为未读

**接口**: `POST /api/notifications/mark-unread`

**请求体**:
```json
{
  "notificationIds": ["1", "2"]
}
```

**响应**:
```json
{
  "success": true,
  "message": "标记成功"
}
```

---

### 4. 全部标记为已读

**接口**: `POST /api/notifications/mark-all-read`

**请求体**: `{}` (空对象)

**响应**:
```json
{
  "success": true,
  "message": "全部标记成功"
}
```

---

### 5. 删除通知

**接口**: `DELETE /api/notifications`

**请求体**:
```json
{
  "notificationIds": ["1", "2"]
}
```

**响应**:
```json
{
  "success": true,
  "message": "删除成功"
}
```

---

### 6. 清空所有通知

**接口**: `POST /api/notifications/clear-all`

**请求体**: `{}` (空对象)

**响应**:
```json
{
  "success": true,
  "message": "清空成功"
}
```

---

## 错误响应

所有接口在失败时返回以下格式：

```json
{
  "success": false,
  "message": "错误描述"
}
```

常见 HTTP 状态码：
- `200`: 成功
- `400`: 请求参数错误
- `401`: 未授权
- `403`: 无权限
- `404`: 资源不存在
- `500`: 服务器内部错误

---

## 使用示例

### Angular 调用示例

```typescript
import { NotificationApiService } from './core/services/notification-api.service';

constructor(private notificationApi: NotificationApiService) {}

// 获取通知
loadNotifications() {
  this.notificationApi.getNotifications().subscribe(response => {
    console.log('通知列表:', response.data);
  });
}

// 标记已读
markAsRead(id: string) {
  this.notificationApi.markAsRead([id]).subscribe(response => {
    console.log('标记成功:', response.success);
  });
}
```

---

## 注意事项

1. **乐观更新**: 前端使用乐观更新策略，先更新 UI 再调用 API，失败时回滚
2. **错误处理**: 所有 API 调用都包含错误处理，失败时会自动回滚 UI 状态
3. **认证**: 大部分接口需要用户登录认证 (Bearer Token)
4. **时间格式**: 使用 ISO 8601 格式 (YYYY-MM-DDTHH:mm:ss.sssZ)
5. **ID 格式**: 通知 ID 为字符串类型，支持 UUID 或其他格式

---

## Mock 数据

开发环境下，如果后端接口未实现，前端会显示默认模拟数据：

```typescript
[
  {
    id: '1',
    title: 'New Update Available',
    message: 'A new version of the platform is available...',
    type: 'info',
    read: false,
    timestamp: new Date(Date.now() - 1000 * 60 * 30)
  },
  // ... 更多通知
]
```

建议后端参考此数据结构实现接口。
