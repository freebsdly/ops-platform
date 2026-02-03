import { Injectable } from '@angular/core';

/**
 * WebSocket 连接管理接口
 */
export interface WebSocketConnection {
  close(): void;
  readyState: number;
}

/**
 * WebSocket 清理服务
 * 集中管理应用中的所有 WebSocket 连接，在登出时统一清理
 */
@Injectable({
  providedIn: 'root'
})
export class WebSocketCleanupService {
  private connections = new Set<WebSocketConnection>();

  /**
   * 注册一个 WebSocket 连接
   */
  registerConnection(connection: WebSocketConnection): void {
    this.connections.add(connection);
  }

  /**
   * 取消注册单个 WebSocket 连接
   */
  unregisterConnection(connection: WebSocketConnection): void {
    this.connections.delete(connection);
  }

  /**
   * 关闭并取消注册单个 WebSocket 连接
   */
  closeConnection(connection: WebSocketConnection): void {
    if (connection && connection.readyState !== WebSocket.CLOSED) {
      connection.close();
    }
    this.connections.delete(connection);
  }

  /**
   * 关闭所有 WebSocket 连接
   * 在登出时调用此方法
   */
  cleanup(): void {
    this.connections.forEach(connection => {
      try {
        if (connection.readyState !== WebSocket.CLOSED) {
          connection.close();
        }
      } catch (error) {
        console.error('Error closing WebSocket connection:', error);
      }
    });
    this.connections.clear();
  }

  /**
   * 获取当前注册的连接数量（用于调试）
   */
  getConnectionCount(): number {
    return this.connections.size;
  }

  /**
   * 检查是否有活跃的连接（用于调试）
   */
  hasActiveConnections(): boolean {
    return Array.from(this.connections).some(
      conn => conn.readyState === WebSocket.OPEN || conn.readyState === WebSocket.CONNECTING
    );
  }
}
