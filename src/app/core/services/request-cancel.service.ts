import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class RequestCancelService {
  private cancelPendingRequests$ = new Subject<void>();

  cancelPendingRequests() {
    this.cancelPendingRequests$.next();
  }

  onCancelPendingRequests() {
    return this.cancelPendingRequests$.asObservable();
  }
}
