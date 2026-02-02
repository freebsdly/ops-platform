import { layoutConfigHandlers } from './handlers/layout-config.handlers';
import { userHandlers } from './handlers/user.handlers';

// 组合所有handlers
export const handlers = [
  ...layoutConfigHandlers,
  ...userHandlers
  // 可以在这里添加其他handlers
];