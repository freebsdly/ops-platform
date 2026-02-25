import { inject } from '@angular/core';
import { CanActivateFn, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Observable, of } from 'rxjs';
import { map, catchError, take } from 'rxjs/operators';
import { PermissionFacade } from '../core/stores/permission/permission.facade';
import { PermissionAuditService } from '../core/services/permission-audit.service';

/**
 * 角色守卫工厂函数
 * @param requiredRoles - 必需的角色列表
 */
export const roleGuard = (requiredRoles: string[]): CanActivateFn => {
  return (route: ActivatedRouteSnapshot, state: RouterStateSnapshot) => {
    const permissionFacade = inject(PermissionFacade);
    const router = inject(Router);
    const auditService = inject(PermissionAuditService);

    if (!requiredRoles || requiredRoles.length === 0) {
      return of(true);
    }

    const hasRequiredRole = requiredRoles.some(role => permissionFacade.hasRole(role));

    requiredRoles.forEach(role => {
      auditService.logRoleCheck(role, hasRequiredRole, { method: 'roleGuard', component: 'roleGuard' });
    });

    if (!hasRequiredRole) {
      router.navigate(['/no-permission'], {
        queryParams: { returnUrl: state.url }
      });
    }

    return of(hasRequiredRole);
  };
};
