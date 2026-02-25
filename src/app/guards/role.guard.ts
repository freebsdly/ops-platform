import { inject } from '@angular/core';
import { CanActivateFn, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Observable, of } from 'rxjs';
import { map, catchError, take } from 'rxjs/operators';
import { PermissionFacade } from '../core/stores/permission/permission.facade';

/**
 * 角色守卫工厂函数
 * @param requiredRoles - 必需的角色列表
 */
export const roleGuard = (requiredRoles: string[]): CanActivateFn => {
  return (route: ActivatedRouteSnapshot, state: RouterStateSnapshot) => {
    const permissionFacade = inject(PermissionFacade);
    const router = inject(Router);

    if (!requiredRoles || requiredRoles.length === 0) {
      // 如果没有要求角色，允许访问
      return of(true);
    }

    // ✅ 使用 PermissionFacade 检查角色（基于 Signals）
    const hasRequiredRole = requiredRoles.some(role => permissionFacade.hasRole(role));

    if (!hasRequiredRole) {
      // 权限不足，重定向到无权限页面
      router.navigate(['/no-permission'], {
        queryParams: { returnUrl: state.url }
      });
    }

    return of(hasRequiredRole);
  };
};
