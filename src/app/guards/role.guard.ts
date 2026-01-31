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
export class RoleGuard implements CanActivate {
  private store = inject(Store<AppState>);
  private router = inject(Router);

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> | boolean {
    const requiredRoles = route.data['roles'] as string[];
    
    if (!requiredRoles || requiredRoles.length === 0) {
      // 如果没有要求角色，允许访问
      return true;
    }

    return this.store.select(AuthSelectors.selectUserRoles).pipe(
      map(userRoles => {
        const hasRequiredRole = requiredRoles.some(role => 
          userRoles.includes(role)
        );
        
        if (!hasRequiredRole) {
          // 权限不足，重定向到登录或首页
          this.router.navigate(['/'], {
            queryParams: { returnUrl: state.url }
          });
        }
        
        return hasRequiredRole;
      })
    );
  }
}