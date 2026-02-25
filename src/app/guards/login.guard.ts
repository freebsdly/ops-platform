import { inject } from '@angular/core';
import { CanActivateFn, Router, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { MODULES_CONFIG } from '../config/menu.config';

/**
 * 登录守卫函数
 * 防止已登录用户访问登录页面
 */
export const loginGuard: CanActivateFn = (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot
): boolean | UrlTree | Observable<boolean | UrlTree> => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const isAuthenticated = authService.isAuthenticated();
  console.log(`LoginGuard: isAuthenticated=${isAuthenticated}, path=${state.url}`);

  if (isAuthenticated) {
    // 已登录：重定向到第一个模块的默认路径
    console.log(`LoginGuard: 用户已认证，重定向到模块`);
    if (MODULES_CONFIG.length > 0) {
      return router.createUrlTree([MODULES_CONFIG[0].defaultPath]);
    } else {
      return router.createUrlTree(['/configuration/management/model']);
    }
  }

  console.log(`LoginGuard: 用户未认证，允许访问登录页`);
  return true;
};
