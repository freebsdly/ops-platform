import { Injectable } from '@angular/core';

/**
 * 定时器清理服务
 * 集中管理应用中的所有定时器，在登出时统一清理
 */
@Injectable({
  providedIn: 'root'
})
export class TimerCleanupService {
  private timers = new Set<ReturnType<typeof setTimeout>>();
  private intervals = new Set<ReturnType<typeof setInterval>>();

  /**
   * 注册一个定时器，返回与 setTimeout 相同的句柄
   */
  registerTimer(handler: () => void, timeout: number): ReturnType<typeof setTimeout> {
    const timerId = setTimeout(handler, timeout);
    this.timers.add(timerId);
    return timerId;
  }

  /**
   * 注册一个间隔定时器，返回与 setInterval 相同的句柄
   */
  registerInterval(handler: () => void, timeout: number): ReturnType<typeof setInterval> {
    const intervalId = setInterval(handler, timeout);
    this.intervals.add(intervalId);
    return intervalId;
  }

  /**
   * 清除单个定时器
   */
  clearTimer(timerId: ReturnType<typeof setTimeout>): void {
    clearTimeout(timerId);
    this.timers.delete(timerId);
  }

  /**
   * 清除单个间隔定时器
   */
  clearInterval(intervalId: ReturnType<typeof setInterval>): void {
    clearInterval(intervalId);
    this.intervals.delete(intervalId);
  }

  /**
   * 清除所有定时器和间隔定时器
   * 在登出时调用此方法
   */
  cleanup(): void {
    // 清除所有 setTimeout
    this.timers.forEach(timerId => clearTimeout(timerId));
    this.timers.clear();

    // 清除所有 setInterval
    this.intervals.forEach(intervalId => clearInterval(intervalId));
    this.intervals.clear();
  }

  /**
   * 获取当前注册的定时器数量（用于调试）
   */
  getTimerCount(): number {
    return this.timers.size;
  }

  /**
   * 获取当前注册的间隔定时器数量（用于调试）
   */
  getIntervalCount(): number {
    return this.intervals.size;
  }
}
