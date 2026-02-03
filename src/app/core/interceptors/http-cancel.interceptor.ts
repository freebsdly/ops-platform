import { Injectable, inject } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpInterceptorFn,
} from '@angular/common/http';
import { Observable, takeUntil } from 'rxjs';
import { RequestCancelService } from '../services/request-cancel.service';

@Injectable()
export class HttpCancelInterceptor implements HttpInterceptor {
  private requestCancelService = inject(RequestCancelService);

  intercept(
    request: HttpRequest<unknown>,
    next: HttpHandler
  ): Observable<HttpEvent<unknown>> {
    return next.handle(request).pipe(
      takeUntil(this.requestCancelService.onCancelPendingRequests())
    );
  }
}

export const httpCancelInterceptor: HttpInterceptorFn = (req, next) => {
  const requestCancelService = inject(RequestCancelService);
  return next(req).pipe(
    takeUntil(requestCancelService.onCancelPendingRequests())
  );
};
