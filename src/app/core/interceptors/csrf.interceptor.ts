import { Injectable, inject } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpErrorResponse,
  HttpResponse
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { CsrfTokenService } from '../services/csrf-token.service';

/**
 * CSRF 拦截器
 * 自动添加CSRF token到所有写请求
 * 从响应中提取CSRF token
 */
@Injectable()
export class CsrfInterceptor {
  constructor(private csrfTokenService: CsrfTokenService) {}

  intercept(
    request: HttpRequest<unknown>,
    next: HttpHandler
  ): Observable<HttpEvent<unknown>> {
    // 确保有CSRF token
    const { token } = this.csrfTokenService.getToken();

    // 只对写请求添加CSRF token

    if (this.isWriteRequest(request) && token) {
      console.log('[CsrfInterceptor] Adding CSRF token to request:', request.url);

      const headers = request.headers;
      const newHeaders = headers.set('X-CSRF-Token', token);

      request = request.clone({
        headers: newHeaders
      });
    }

    return next.handle(request).pipe(
      tap((event) => {
        // 从响应中提取CSRF token
        if (event instanceof HttpResponse) {
          this.extractCsrfToken(event);
        }
      }),
      catchError((error: HttpErrorResponse) => {
        // 如果是CSRF验证失败（403），刷新token并重试
        if (error.status === 403 && this.isCsrfError(error)) {
          console.log('[CsrfInterceptor] CSRF validation failed, refreshing token');
          return this.handleCsrfError(request, next);
        }

        return throwError(() => error);
      })
    );
  }

  /**
   * 判断是否为写请求
   */
  private isWriteRequest(request: HttpRequest<unknown>): boolean {
    const method = request.method.toUpperCase();
    return ['POST', 'PUT', 'PATCH', 'DELETE'].includes(method);
  }

  /**
   * 判断是否为CSRF错误
   */
  private isCsrfError(error: HttpErrorResponse): boolean {
    return error.status === 403 &&
           (error.error?.message?.includes('CSRF') ||
            error.message?.includes('CSRF'));
  }

  /**
   * 从响应中提取CSRF token
   */
  private extractCsrfToken(event: HttpResponse<unknown>): void {
    // 从响应头获取
    const csrfToken = event.headers.get('X-CSRF-Token');

    if (csrfToken) {
      console.log('[CsrfInterceptor] CSRF token found in response headers');
      sessionStorage.setItem('csrf_token', csrfToken);
      return;
    }

    // 从响应体获取
    const body = event.body as any;
    if (body?.data?.csrfToken) {
      console.log('[CsrfInterceptor] CSRF token found in response body');
      sessionStorage.setItem('csrf_token', body.data.csrfToken);
    }
  }

  /**
   * 处理CSRF错误
   */
  private handleCsrfError(
    request: HttpRequest<unknown>,
    next: HttpHandler
  ): Observable<HttpEvent<unknown>> {
    // 刷新CSRF token
    const newToken = this.csrfTokenService.refreshToken();

    console.log('[CsrfInterceptor] Retrying request with new CSRF token');

    // 用新token重试请求
    const headers = request.headers;
    const newHeaders = headers.set('X-CSRF-Token', newToken);

    const newRequest = request.clone({
      headers: newHeaders
    });

    return next.handle(newRequest);
  }
}
