import { inject } from '@angular/core';
import { CanActivateFn, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Observable, of } from 'rxjs';
import { map, catchError, take } from 'rxjs/operators';
import { Store } from '@ngrx/store';
import { AppState } from '../core/types/app-state';
import * as AuthSelectors from '../core/stores/auth/auth.selectors';

/**
 * 角色守卫工厂函数
 * @param requiredRoles - 必需的角色列表
 */
export const roleGuard = (requiredRoles: string[]): CanActivateFn => {
  return (route: ActivatedRouteSnapshot, state: RouterStateSnapshot) => {
    const store = inject(Store<AppState>);
    const router = inject(Router);

    if (!requiredRoles || requiredRoles.length === 0) {
      // 如果没有要求角色，允许访问
      return of(true);
    }

    return store.select(AuthSelectors.selectUserRoles).pipe(
      take(1),
      map(userRoles => {
        const hasRequiredRole = requiredRoles.some(role =>
          userRoles.includes(role)
        );

        if (!hasRequiredRole) {
          // 权限不足，重定向到无权限页面
          router.navigate(['/no-permission'], {
            queryParams: { returnUrl: state.url }
          });
        }

        return hasRequiredRole;
      }),
      catchError(error => {
        console.error('角色检查失败:', error);
        router.navigate(['/no-permission'], {
          queryParams: { returnUrl: state.url }
        });
        return of(false);
      })
    );
  };
};
