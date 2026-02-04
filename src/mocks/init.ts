// MSW初始化
// 这个文件应该只在开发环境中使用

// 定义开发环境检测
const isDevelopment = () => {
  const hostname = window.location.hostname;
  return hostname === 'localhost' ||
         hostname === '127.0.0.1' ||
         hostname === '' ||
         hostname.startsWith('192.168.') ||
         hostname.startsWith('10.');
};

// 异步初始化MSW
export const initMsw = async () => {
  if (!isDevelopment()) {
    console.log('MSW: 非开发环境，跳过初始化');
    return;
  }

  console.log('MSW: 开始初始化...');

  try {
    // 动态导入以避免生产环境打包
    const { worker } = await import('./browser');

    console.log('MSW: Worker加载成功，准备启动...');

    // 启动worker
    await worker.start({
      onUnhandledRequest: 'bypass', // 对于未处理的请求，绕过MSW
      serviceWorker: {
        url: '/mockServiceWorker.js'
      },
      quiet: false, // 显示MSW启动日志
    });

    console.log('✅ MSW已成功启动');

  } catch (error) {
    console.error('❌ MSW初始化失败:', error);
  }
};