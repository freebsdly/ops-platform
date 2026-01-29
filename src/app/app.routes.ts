import { Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: '/welcome' },
  { path: 'login', loadChildren: () => import('./pages/login/login.routes').then(m => m.LOGIN_ROUTES) },
  { 
    path: 'welcome', 
    loadChildren: () => import('./pages/welcome/welcome.routes').then(m => m.WELCOME_ROUTES)
  },
  { 
    path: '', 
    loadChildren: () => import('./pages/generic-page/generic-page.routes').then(m => m.default),
    canActivate: [AuthGuard]
  },
];
