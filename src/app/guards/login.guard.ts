import { Injectable, inject } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { MODULES_CONFIG } from '../config/menu.config';

@Injectable({
  providedIn: 'root',
})
export class LoginGuard implements CanActivate {
  private authService = inject(AuthService);
  private router = inject(Router);

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean | UrlTree | Observable<boolean | UrlTree> {
    const isAuthenticated = this.authService.isAuthenticated();
    console.log(`LoginGuard: isAuthenticated=${isAuthenticated}, path=${state.url}`);
    
    if (isAuthenticated) {
      // 已登录：重定向到第一个模块的默认路径
      console.log(`LoginGuard: 用户已认证，重定向到模块`);
      if (MODULES_CONFIG.length > 0) {
        return this.router.createUrlTree([MODULES_CONFIG[0].defaultPath]);
      } else {
        return this.router.createUrlTree(['/configuration/management/model']);
      }
    }

    console.log(`LoginGuard: 用户未认证，允许访问登录页`);
    return true;
  }
}
