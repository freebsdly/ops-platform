import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';

// 开发环境中初始化MSW
async function initializeApp() {
  // 开发环境检测（与init.ts保持一致）
  const isDevelopment = () => {
    const hostname = window.location.hostname;
    return hostname === 'localhost' ||
           hostname === '127.0.0.1' ||
           hostname === '' ||
           hostname.startsWith('192.168.') ||
           hostname.startsWith('10.');
  };

  // 只在开发环境初始化MSW
  if (isDevelopment()) {
    try {
      // 动态导入以避免生产环境打包
      const { initMsw } = await import('./mocks/init');
      await initMsw();
      console.log('✅ 开发环境MSW初始化完成');
    } catch (error) {
      console.warn('⚠️ MSW初始化失败:', error);
      console.warn('应用将继续运行，但API请求不会被Mock');
    }
  } else {
    console.log('生产环境，跳过MSW初始化');
  }
  
  // 启动Angular应用
  try {
    await bootstrapApplication(App, appConfig);
  } catch (error) {
    console.error('Angular应用启动失败:', error);
  }
}

// 启动应用
initializeApp();
