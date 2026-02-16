import { layoutConfigHandlers } from './handlers/layout-config.handlers';
import { userHandlers } from './handlers/user.handlers';
import { notificationHandlers } from './handlers/notification.handlers';

// 组合所有handlers
export const handlers = [
  ...layoutConfigHandlers,
  ...userHandlers,
  ...notificationHandlers
  // 可以在这里添加其他handlers
];