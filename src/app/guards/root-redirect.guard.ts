import { inject } from '@angular/core';
import { CanActivateFn, Router, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { MODULES_CONFIG } from '../config/menu.config';
import { SecureTokenService } from '../core/services/secure-token.service';

/**
 * 根路径重定向守卫函数
 * 根据用户状态重定向到合适的页面
 */
export const rootRedirectGuard: CanActivateFn = (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot
): boolean | UrlTree | Observable<boolean | UrlTree> => {
  const secureTokenService = inject(SecureTokenService);
  const router = inject(Router);

  // 使用安全Token服务检查认证状态
  const hasToken = secureTokenService.hasToken();

  if (hasToken) {
    // 已登录：重定向到第一个模块的默认路径
    if (MODULES_CONFIG.length > 0) {
      return router.createUrlTree([MODULES_CONFIG[0].defaultPath]);
    } else {
      // 如果没有配置模块，重定向到欢迎页
      return router.createUrlTree(['/welcome']);
    }
  } else {
    // 未登录：重定向到login
    return router.createUrlTree(['/login']);
  }
};
