import { setupWorker } from 'msw/browser';
import { handlers } from './handlers';

// 创建并导出worker实例
export const worker = setupWorker(...handlers);