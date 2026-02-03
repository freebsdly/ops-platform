import { Injectable } from '@angular/core';

/**
 * Service Worker 清理服务
 * 集中管理 Service Worker 注册和浏览器缓存，在登出时统一清理
 */
@Injectable({
  providedIn: 'root'
})
export class ServiceWorkerCleanupService {
  /**
   * 清除所有 Service Worker 注册
   */
  async cleanupServiceWorkers(): Promise<void> {
    if ('serviceWorker' in navigator) {
      try {
        const registrations = await navigator.serviceWorker.getRegistrations();

        for (const registration of registrations) {
          await registration.unregister();
        }

        console.log(`ServiceWorkerCleanup: 已注销 ${registrations.length} 个 Service Worker`);
      } catch (error) {
        console.error('ServiceWorkerCleanup: 注销 Service Worker 失败:', error);
      }
    }
  }

  /**
   * 清除所有浏览器缓存（Cache API）
   */
  async cleanupCache(): Promise<void> {
    if ('caches' in window) {
      try {
        const cacheNames = await caches.keys();

        await Promise.all(
          cacheNames.map(cacheName => caches.delete(cacheName))
        );

        console.log(`ServiceWorkerCleanup: 已清除 ${cacheNames.length} 个缓存`);
      } catch (error) {
        console.error('ServiceWorkerCleanup: 清除缓存失败:', error);
      }
    }
  }

  /**
   * 清除所有 Service Worker 和缓存
   * 在登出时调用此方法
   */
  async cleanup(): Promise<void> {
    await Promise.all([
      this.cleanupServiceWorkers(),
      this.cleanupCache()
    ]);
  }

  /**
   * 获取当前 Service Worker 注册数量（用于调试）
   */
  async getRegistrationCount(): Promise<number> {
    if ('serviceWorker' in navigator) {
      try {
        const registrations = await navigator.serviceWorker.getRegistrations();
        return registrations.length;
      } catch {
        return 0;
      }
    }
    return 0;
  }

  /**
   * 获取当前缓存数量（用于调试）
   */
  async getCacheCount(): Promise<number> {
    if ('caches' in window) {
      try {
        const cacheNames = await caches.keys();
        return cacheNames.length;
      } catch {
        return 0;
      }
    }
    return 0;
  }
}
