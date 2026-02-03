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
    console.log('MSW: 可以拦截以下API请求:');
    console.log('  - GET /api/config/layout - 获取完整布局配置');
    console.log('  - POST /api/config/layout - 保存布局配置');
    console.log('  - GET /api/config/app - 获取应用配置');
    console.log('  - POST /api/config/validate - 验证配置');

    // 验证MSW是否正常工作
    setTimeout(async () => {
      try {
        const testResponse = await fetch('/api/config/layout');
        if (testResponse.ok) {
          const data = await testResponse.json();
          console.log(`✅ MSW验证: 成功拦截请求，返回应用标题: "${data.appTitle}"`);
        } else {
          console.warn('⚠️ MSW验证: 请求失败，状态:', testResponse.status);
        }
      } catch (error) {
        console.warn('⚠️ MSW验证: 测试请求失败:', error);
      }
    }, 500);

  } catch (error) {
    console.error('❌ MSW初始化失败:', error);
    console.warn('这可能是因为:');
    console.warn('1. mockServiceWorker.js文件不存在于public目录');
    console.warn('2. Service Worker范围设置不正确');
    console.warn('3. 浏览器不支持Service Worker');
    console.warn('应用将继续运行，但API请求不会被Mock');
  }
};
