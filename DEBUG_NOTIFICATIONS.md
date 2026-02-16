# 通知系统调试指南

## 已知问题和修复

### 问题 1: `timestamp.getTime is not a function`

**症状**: 控制台报错 `timestamp.getTime is not a function`

**原因**: HTTP 传输过程中，Date 对象被序列化为 ISO 字符串（如 `"2025-02-15T12:34:56.789Z"`），但组件代码期望接收 Date 对象。

**已修复**:
1. ✅ 在 `formatTimestamp` 方法中添加类型检查：`timestamp instanceof Date ? timestamp : new Date(timestamp)`
2. ✅ 在 `NotificationService` 中添加 `normalizeNotificationData` 方法，确保所有 timestamp 字段都是 Date 对象
3. ✅ 在 `updateNotifications` 方法中应用数据标准化

**如果仍然出现此错误**:
- 检查浏览器控制台中的实际数据类型
- 确认 MSW handlers 返回的是 Date 对象
- 验证 `NotificationService.normalizeNotificationData` 被正确调用

---

## 问题诊断

如果通知没有数据显示，请按以下步骤检查：

## 1. 检查 MSW 是否正常启动

打开浏览器控制台（F12），应该看到以下日志：

```
MSW: 开始初始化...
MSW: Worker加载成功，准备启动...
✅ MSW已成功启动
✅ 开发环境MSW初始化完成
```

如果没有看到这些日志，说明 MSW 没有启动，API 请求不会被 Mock。

## 2. 检查 API 请求日志

在浏览器控制台中，应该看到以下请求日志：

```
NotificationApiService: 获取通知列表
NotificationApiService: 原始响应: {data: Array(12), total: 12, unreadCount: 7}
NotificationApiService: 通知数组: [{id: "1", title: "New Update Available", ...}, ...]
NotificationApiService: 获取到 12 条通知
NotificationService: 加载通知成功
```

**如果只看到第一行**：
- 检查网络面板，确认 `/api/notifications` 请求是否被 MSW 拦截
- 如果看到 404 或 500 错误，说明 MSW 没有正确拦截请求

**如果看到任何错误**：
- 检查错误消息，确认是网络错误还是解析错误

## 3. 检查网络面板

打开浏览器开发者工具的 Network（网络）面板：

1. 筛选 XHR/Fetch 请求
2. 查找 `GET /api/notifications` 请求
3. 检查：
   - 状态码应该是 200
   - Response 应该包含 `{code: 0, message: "success", data: {...}}`
   - Preview 面板中应该能看到通知数组

**如果请求显示为红色（失败）**：
- 检查 MSW 是否启动（见第 1 步）
- 检查端口是否正确（默认 4200 或 4201）

**如果请求没有被拦截**：
- 刷新页面
- 检查 `src/mocks/handlers.ts` 是否包含 `notificationHandlers`
- 检查 `public/mockServiceWorker.js` 文件是否存在

## 4. 检查响应拦截器

由于应用使用了 `apiResponseInterceptor`，它会自动解包 `{code, message, data}` 格式的响应。

**拦截器工作流程：**

1. MSW 返回:
   ```json
   {
     "code": 0,
     "message": "success",
     "data": {
       "data": [...通知数组...],
       "total": 12,
       "unreadCount": 7
     }
   }
   ```

2. `apiResponseInterceptor` 自动解包为:
   ```json
   {
     "data": [...通知数组...],
     "total": 12,
     "unreadCount": 7
   }
   ```

3. `NotificationApiService` 接收解包后的数据

**如果解包失败**，可能的原因：
- 响应格式不匹配
- 拦截器没有正确配置

## 5. 手动测试 API

在浏览器控制台中运行以下代码来手动测试 API：

```javascript
// 测试获取通知
fetch('/api/notifications')
  .then(r => r.json())
  .then(d => {
    console.log('MSW 响应:', d);
    console.log('通知数量:', d.data.data.length);
    console.log('未读数量:', d.data.unreadCount);
  });
```

预期输出：
```
MSW 响应: {code: 0, message: "success", data: {...}}
通知数量: 12
未读数量: 7
```

## 6. 检查组件状态

在浏览器控制台中检查组件状态：

```javascript
// 获取通知组件实例（需要先用开发者工具选择元素）
const notificationComponent = ng.probe($0)?.componentInstance;
console.log('通知数量:', notificationComponent.notifications());
console.log('未读数量:', notificationComponent.unreadCount());
console.log('加载状态:', notificationComponent.loading());
```

## 7. 常见问题排查

### 问题 1: 通知列表为空

**症状**: 页面显示 "No notifications" 或空白

**可能原因**:
1. MSW 未启动 - 检查控制台是否有 MSW 启动日志
2. 信号响应性问题 - 已修复，使用 computed 包装
3. API 请求失败 - 检查网络面板

**解决方案**:
- 刷新页面
- 检查控制台错误
- 验证 MSW handlers 正确导出

### 问题 2: `ctx.notifications() is undefined`

**症状**: 控制台报错

**已修复**: 已在 `notification.ts` 中添加防御性检查

如果仍然出现：
```typescript
notifications = computed(() => {
  const value = this.serviceNotifications();
  return value || [];
});
```

### 问题 3: 请求返回 404

**症状**: Network 面板显示 `/api/notifications` 404 错误

**可能原因**:
1. MSW 没有拦截请求
2. 端口不匹配
3. Service Worker 未注册

**解决方案**:
1. 确认开发环境（localhost）
2. 检查 `src/main.ts` 中 MSW 初始化
3. 清除浏览器缓存和 Service Worker

### 问题 4: 数据格式错误

**症状**: 控制台显示 "Cannot read property 'data' of undefined"

**已修复**: 已移除 `NotificationApiService` 中的重复解包

## 8. 重置步骤

如果以上都不行，尝试完全重置：

```bash
# 1. 停止开发服务器
# Ctrl+C

# 2. 清除构建缓存
rm -rf dist/

# 3. 清除 node_modules/.cache
rm -rf node_modules/.cache/

# 4. 重新启动
npm start
```

然后在浏览器中：
1. 打开开发者工具（F12）
2. Application > Storage > Clear site data
3. 刷新页面

## 9. 验证 Mock 数据

检查 MSW mock 数据是否正确：

```javascript
// 在控制台中查看 MSW 日志
// 应该看到: [MSW] GET /api/notifications - 返回通知列表
```

或者访问 `/src/mocks/handlers/notification.handlers.ts` 文件，确认：
- 有 12 条 mock 通知
- 使用 `new Date()` 而不是字符串
- handlers 已正确导出

## 10. 检查文件清单

确认以下文件存在且正确：

✅ `/src/mocks/handlers/notification.handlers.ts` - MSW handlers
✅ `/src/mocks/handlers.ts` - 导出所有 handlers
✅ `/src/mocks/browser.ts` - MSW worker 实例
✅ `/src/mocks/init.ts` - MSW 初始化逻辑
✅ `/src/main.ts` - 应用启动时初始化 MSW
✅ `/public/mockServiceWorker.js` - Service Worker 脚本
✅ `/src/app/core/services/notification-api.service.ts` - API 服务（已修复重复解包）
✅ `/src/app/services/notification.service.ts` - 状态管理服务
✅ `/src/app/layout/notification/notification.ts` - 通知组件（已修复信号响应性）

## 联系支持

如果问题仍然存在，请提供：
1. 浏览器控制台完整日志（包含所有错误和警告）
2. Network 面板截图（显示 /api/notifications 请求）
3. MSW 启动日志
4. Angular 版本和 MSW 版本
