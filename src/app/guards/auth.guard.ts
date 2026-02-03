import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean {
    const isAuthenticated = this.authService.isAuthenticated();
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