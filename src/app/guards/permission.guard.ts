import { Injectable, inject } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Store } from '@ngrx/store';
import { AppState } from '../core/types/app-state';
import * as AuthSelectors from '../core/stores/auth/auth.selectors';

@Injectable({
  providedIn: 'root',
})
export class PermissionGuard implements CanActivate {
  private store = inject(Store<AppState>);
  private router = inject(Router);

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> | boolean {
    const requiredPermission = route.data['permission'] as {
      resource: string;
      action: string;
    };
    
    if (!requiredPermission) {
      // 如果没有要求权限，允许访问
      return true;
    }

    return this.store.select(AuthSelectors.selectHasPermission(
      requiredPermission.resource,
      requiredPermission.action
    )).pipe(
      map(hasPermission => {
        if (!hasPermission) {
          // 权限不足，重定向到登录或首页
          this.router.navigate(['/'], {
            queryParams: { returnUrl: state.url }
          });
        }
        
        return hasPermission;
      })
    );
  }
}