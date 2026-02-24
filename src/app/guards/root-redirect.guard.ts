import { Injectable, inject } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { MODULES_CONFIG } from '../config/menu.config';
import { SecureTokenService } from '../core/services/secure-token.service';

@Injectable({
  providedIn: 'root',
})
export class RootRedirectGuard implements CanActivate {
  private secureTokenService = inject(SecureTokenService);
  private router = inject(Router);

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean | UrlTree | Observable<boolean | UrlTree> | Promise<boolean | UrlTree> {
    // 使用安全Token服务检查认证状态
    const hasToken = this.secureTokenService.hasToken();

    if (hasToken) {
      // 已登录：重定向到第一个模块的默认路径
      if (MODULES_CONFIG.length > 0) {
        return this.router.createUrlTree([MODULES_CONFIG[0].defaultPath]);
      } else {
        // 如果没有配置模块，重定向到欢迎页
        return this.router.createUrlTree(['/welcome']);
      }
    } else {
      // 未登录：重定向到login
      return this.router.createUrlTree(['/login']);
    }
  }
}
