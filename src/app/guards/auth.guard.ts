import { inject } from '@angular/core';
import { CanActivateFn, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { SecureTokenService } from '../core/services/secure-token.service';

/**
 * 认证守卫函数
 * 检查用户是否已登录
 */
export const authGuard: CanActivateFn = (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot
) => {
  const secureTokenService = inject(SecureTokenService);
  const router = inject(Router);

  const isAuthenticated = secureTokenService.isAuthenticated();
  console.log(`AuthGuard检查: isAuthenticated=${isAuthenticated}, path=${state.url}`);

  if (isAuthenticated) {
    return true;
  }

  // Store attempted URL for redirecting
  console.log(`AuthGuard: 用户未认证，导航到/login, returnUrl=${state.url}`);
  router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
  return false;
};
