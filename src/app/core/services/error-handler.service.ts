import { Injectable, inject } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { NzMessageService } from 'ng-zorro-antd/message';

/**
 * 应用错误类型
 */
export enum ErrorType {
  NETWORK = 'network',
  AUTHENTICATION = 'authentication',
  AUTHORIZATION = 'authorization',
  VALIDATION = 'validation',
  SERVER = 'server',
  UNKNOWN = 'unknown'
}

/**
 * 结构化错误信息
 */
export interface AppError {
  type: ErrorType;
  code: string | number;
  message: string;
  userMessage: string;
  details?: any;
  timestamp: number;
  stack?: string;
}

/**
 * 错误日志条目
 */
export interface ErrorLogEntry {
  error: AppError;
  url: string;
  userId?: number;
  username?: string;
  userAgent: string;
}

/**
 * ErrorHandlerService - 统一错误处理服务
 *
 * 提供结构化的错误处理、日志记录和用户友好的错误消息
 */
@Injectable({
  providedIn: 'root'
})
export class ErrorHandlerService {
  private router = inject(Router);
  private message = inject(NzMessageService);

  private errorLogs: ErrorLogEntry[] = [];
  private readonly MAX_LOG_ENTRIES = 100;

  /**
   * 处理 HTTP 错误
   */
  handleHttpError(error: HttpErrorResponse): AppError {
    console.error('[ErrorHandlerService] HTTP Error:', error);

    const appError = this.createHttpError(error);

    // 记录错误
    this.logError(appError);

    // 显示用户友好的错误消息
    this.showUserMessage(appError);

    // 特殊处理认证错误
    if (appError.type === ErrorType.AUTHENTICATION) {
    this.handleAuthenticationError();
    }

    return appError;
  }

  /**
   * 处理通用错误
   */
  handleError(error: any): AppError {
    console.error('[ErrorHandlerService] Error:', error);

    const appError = this.createGenericError(error);

    // 记录错误
    this.logError(appError);

    // 显示用户友好的错误消息
    this.showUserMessage(appError);

    return appError;
  }

  /**
   * 创建 HTTP 错误对象
   */
  private createHttpError(error: HttpErrorResponse): AppError {
    const baseError: AppError = {
      type: ErrorType.UNKNOWN,
      code: error.status || 0,
      message: error.message || 'Unknown error',
      userMessage: '发生了一个错误，请稍后重试',
      timestamp: Date.now(),
      stack: error.error?.stack
    };

    switch (error.status) {
      case 0:
        baseError.type = ErrorType.NETWORK;
        baseError.message = 'Network connection failed';
        baseError.userMessage = '网络连接失败，请检查网络设置';
        break;

      case 400:
        baseError.type = ErrorType.VALIDATION;
        baseError.message = 'Bad request';
        baseError.userMessage = '请求参数错误，请检查输入';
        baseError.details = error.error;
        break;

      case 401:
      case 403:
        baseError.type = error.status === 401 ? ErrorType.AUTHENTICATION : ErrorType.AUTHORIZATION;
        baseError.message = error.status === 401 ? 'Unauthorized' : 'Forbidden';
        baseError.userMessage = error.status === 401 ? '登录已过期，请重新登录' : '权限不足，无法访问此资源';
        break;

      case 404:
        baseError.type = ErrorType.VALIDATION;
        baseError.message = 'Not found';
        baseError.userMessage = '请求的资源不存在';
        break;

      case 422:
        baseError.type = ErrorType.VALIDATION;
        baseError.message = 'Unprocessable entity';
        baseError.userMessage = '数据验证失败，请检查输入';
        baseError.details = error;
        break;

      case 500:
      case 502:
      case 503:
      case 504:
        baseError.type = ErrorType.SERVER;
        baseError.message = 'Server error';
        baseError.userMessage = '服务器错误，请稍后重试';
        break;

      default:
        if (error.status >= 400 && error.status < 500) {
          baseError.type = ErrorType.VALIDATION;
          baseError.userMessage = '客户端错误';
        } else if (error.status >= 500) {
          baseError.type = ErrorType.SERVER;
          baseError.userMessage = '服务器错误，请稍后重试';
        }
    }

    // 尝试从响应中提取更详细的错误信息
    if (error.error) {
      if (typeof error.error === 'string') {
        baseError.message = error.error;
      } else if (error.error.message) {
        baseError.message = error.error.message;
        baseError.userMessage = error.error.message;
      } else if (error.error.error) {
        baseError.message = error.error.error;
        baseError.userMessage = error.error.error;
      }
    }

    return baseError;
  }

  /**
   * 创建通用错误对象
   */
  private createGenericError(error: any): AppError {
    const appError: AppError = {
      type: ErrorType.UNKNOWN,
      code: 'GENERIC_ERROR',
      message: error?.message || 'Unknown error',
      userMessage: '发生了一个错误，请稍后重试',
      timestamp: Date.now(),
      stack: error?.stack
    };

    // 尝试识别错误类型
    if (error instanceof TypeError) {
      appError.type = ErrorType.VALIDATION;
      appError.code = 'TYPE_ERROR';
      appError.userMessage = '数据类型错误';
    } else if (error instanceof ReferenceError) {
      appError.type = ErrorType.UNKNOWN;
      appError.code = 'REFERENCE_ERROR';
      appError.userMessage = '应用错误，请联系管理员';
    } else if (error.name) {
      appError.code = error.name;
    }

    return appError;
  }

  /**
   * 记录错误
   */
  private logError(error: AppError): void {
    const logEntry: ErrorLogEntry = {
      error,
      url: this.router.url,
      userId: this.getUserId(),
      username: this.getUsername(),
      userAgent: navigator.userAgent
    };

    // 添加到日志
    this.errorLogs.push(logEntry);

    // 限制日志大小
    if (this.errorLogs.length > this.MAX_LOG_ENTRIES) {
      this.errorLogs.shift();
    }

    // 结构化日志输出
    console.error('[ErrorHandlerService] Error Log:', {
      type: error.type,
      code: error.code,
      message: error.message,
      url: logEntry.url,
      userId: logEntry.userId,
      username: logEntry.username,
      timestamp: new Date(error.timestamp).toISOString()
    });

    // TODO: 发送到日志服务（如 Sentry、LogRocket）
    // this.sendToLoggingService(logEntry);
  }

  /**
   * 显示用户友好的错误消息
   */
  private showUserMessage(error: AppError): void {
    // 只显示非网络错误（避免频繁提示）
    if (error.type !== ErrorType.NETWORK) {
      this.message.error(error.userMessage);
    }
  }

  /**
   * 处理认证错误
   */
  private handleAuthenticationError(): void {
    console.warn('[ErrorHandlerService] Handling authentication error');

    // 导航到登录页
    setTimeout(() => {
      this.router.navigate(['/login'], {
        queryParams: {
          returnUrl: this.router.url
        }
      });
    }, 1000);
  }

  /**
   * 获取当前用户ID
   */
  private getUserId(): number | undefined {
    // TODO: 从 Store 获取当前用户ID
    return undefined;
  }

  /**
   * 获取当前用户名
   */
  private getUsername(): string | undefined {
    // TODO: 从 Store 获取当前用户名
    return undefined;
  }

  /**
   * 获取所有错误日志
   */
  getErrorLogs(): ErrorLogEntry[] {
    return [...this.errorLogs];
  }

  /**
   * 清除错误日志
   */
  clearErrorLogs(): void {
    this.errorLogs = [];
  }

  /**
   * 获取最近的错误
   */
  getRecentErrors(count: number = 10): ErrorLogEntry[] {
    return this.errorLogs.slice(-count);
  }

  /**
   * 发送到日志服务
   */
  private sendToLoggingService(logEntry: ErrorLogEntry): void {
    // TODO: 集成 Sentry、LogRocket 或其他日志服务
    // 示例：
    // Sentry.captureException(new Error(logEntry.error.message), {
    //   extra: {
    //     type: logEntry.error.type,
    //     code: logEntry.error.code,
    //     url: logEntry.url,
    //     userId: logEntry.userId,
    //     username: logEntry.username
    //   }
    // });
  }
}
