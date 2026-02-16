import { Injectable } from '@angular/core';
import {
  HttpEvent,
  HttpInterceptor,
  HttpHandler,
  HttpRequest,
  HttpInterceptorFn,
  HttpResponse,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { ApiResponse } from '../types/api-response.interface';

/**
 * 响应拦截器 - 自动解包统一响应格式 {code, message, data}
 */
@Injectable()
export class ApiResponseInterceptor implements HttpInterceptor {
  intercept(
    request: HttpRequest<unknown>,
    next: HttpHandler
  ): Observable<HttpEvent<unknown>> {
    return next.handle(request).pipe(
      map((event) => {
        // 只处理 HttpResponse
        if (event instanceof HttpResponse) {
          // 检查响应体是否为统一格式
          const body = event.body as any;

          // 如果响应体具有 code, message, data 结构，则自动解包
          if (body && typeof body === 'object' && 'code' in body && 'data' in body) {
            const apiResponse = body as ApiResponse<unknown>;

            // 检查 code 是否为 0（成功）
            if (apiResponse.code === 0) {
              // 成功：返回解包后的 data
              return event.clone({ body: apiResponse.data });
            } else {
              // 失败：抛出错误，包含错误信息
              throw {
                status: event.status,
                statusText: event.statusText,
                message: apiResponse.message || '请求失败',
                code: apiResponse.code
              };
            }
          }
        }

        // 非统一格式的响应，直接返回
        return event;
      }),
      catchError((error: HttpErrorResponse) => {
        // 处理 HTTP 错误（网络错误、4xx、5xx等）
        const errorMessage = this.getErrorMessage(error);
        console.error('API 请求失败:', errorMessage, error);

        // 尝试从错误响应中提取统一格式的错误信息
        if (error.error && typeof error.error === 'object' && 'code' in error.error) {
          const apiErrorResponse = error.error as ApiResponse<unknown>;
          return throwError(() => ({
            status: error.status,
            statusText: error.statusText,
            message: apiErrorResponse.message || errorMessage,
            code: apiErrorResponse.code
          }));
        }

        return throwError(() => error);
      })
    );
  }

  /**
   * 获取友好的错误消息
   */
  private getErrorMessage(error: HttpErrorResponse): string {
    if (error.error?.message) {
      return error.error.message;
    }

    switch (error.status) {
      case 0:
        return '网络连接失败，请检查网络';
      case 400:
        return '请求参数错误';
      case 401:
        return '未授权，请重新登录';
      case 403:
        return '权限不足';
      case 404:
        return '请求的资源不存在';
      case 500:
        return '服务器内部错误';
      case 502:
        return '网关错误';
      case 503:
        return '服务暂时不可用';
      case 504:
        return '请求超时';
      default:
        return `请求失败 (${error.status})`;
    }
  }
}

/**
 * 函数式拦截器版本（Angular 15+ 推荐）
 */
export const apiResponseInterceptor: HttpInterceptorFn = (req, next) => {
  return next(req).pipe(
    map((event) => {
      // 只处理 HttpResponse
      if (event instanceof HttpResponse) {
        // 检查响应体是否为统一格式
        const body = event.body as any;

        // 如果响应体具有 code, message, data 结构，则自动解包
        if (body && typeof body === 'object' && 'code' in body && 'data' in body) {
          const apiResponse = body as ApiResponse<unknown>;

          // 检查 code 是否为 0（成功）
          if (apiResponse.code === 0) {
            // 成功：返回解包后的 data
            return event.clone({ body: apiResponse.data });
          } else {
            // 失败：抛出错误，包含错误信息
            throw {
              status: event.status,
              statusText: event.statusText,
              message: apiResponse.message || '请求失败',
              code: apiResponse.code
            };
          }
        }
      }

      // 非统一格式的响应，直接返回
      return event;
    }),
    catchError((error: HttpErrorResponse) => {
      // 处理 HTTP 错误（网络错误、4xx、5xx等）
      const errorMessage = getErrorMessage(error);
      console.error('API 请求失败:', errorMessage, error);

      // 尝试从错误响应中提取统一格式的错误信息
      if (error.error && typeof error.error === 'object' && 'code' in error.error) {
        const apiErrorResponse = error.error as ApiResponse<unknown>;
        throw {
          status: error.status,
          statusText: error.statusText,
          message: apiErrorResponse.message || errorMessage,
          code: apiErrorResponse.code
        };
      }

      throw error;
    })
  );
};

/**
 * 获取友好的错误消息
 */
function getErrorMessage(error: HttpErrorResponse): string {
  if (error.error?.message) {
    return error.error.message;
  }

  switch (error.status) {
    case 0:
      return '网络连接失败，请检查网络';
    case 400:
      return '请求参数错误';
    case 401:
      return '未授权，请重新登录';
    case 403:
      return '权限不足';
    case 404:
      return '请求的资源不存在';
    case 500:
      return '服务器内部错误';
    case 502:
      return '网关错误';
    case 503:
      return '服务暂时不可用';
    case 504:
      return '请求超时';
    default:
      return `请求失败 (${error.status})`;
  }
}
