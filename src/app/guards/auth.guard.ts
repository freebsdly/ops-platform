import { Injectable, inject } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot } from '@angular/router';
import { SecureTokenService } from '../core/services/secure-token.service';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  private secureTokenService = inject(SecureTokenService);
  private router = inject(Router);

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean {
    const isAuthenticated = this.secureTokenService.isAuthenticated();
    console.log(`AuthGuard检查: isAuthenticated=${isAuthenticated}, path=${state.url}`);
    
    if (isAuthenticated) {
      return true;
    }

    // Store the attempted URL for redirecting
    console.log(`AuthGuard: 用户未认证，导航到/login, returnUrl=${state.url}`);
    this.router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
    return false;
  }
}