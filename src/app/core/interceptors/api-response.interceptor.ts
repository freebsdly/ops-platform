import { Injectable, inject } from '@angular/core';
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
import { ErrorHandlerService, AppError } from '../services/error-handler.service';

/**
 * 响应拦截器 - 自动解包统一响应格式 {code, message, data}
 */
@Injectable()
export class ApiResponseInterceptor implements HttpInterceptor {
  private errorHandler = inject(ErrorHandlerService);

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
        // 使用统一的错误处理服务
        const appError = this.errorHandler.handleHttpError(error);

        return throwError(() => appError);
      })
    );
  }
}

/**
 * 函数式拦截器版本（Angular 15+ 推荐）
 */
export const apiResponseInterceptor: HttpInterceptorFn = (req, next) => {
  const errorHandler = inject(ErrorHandlerService);

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
      // 使用统一的错误处理服务
      const appError = errorHandler.handleHttpError(error);

      return throwError(() => appError);
    })
  );
};
