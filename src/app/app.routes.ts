import { Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';
import { RootRedirectGuard } from './guards/root-redirect.guard';
import { EmptyComponent } from './components/empty.component';

export const routes: Routes = [
  { 
    path: '', 
    pathMatch: 'full', 
    canActivate: [RootRedirectGuard],
    component: EmptyComponent
  },
  { path: 'login', loadChildren: () => import('./pages/login/login.routes').then(m => m.LOGIN_ROUTES) },
  { 
    path: '', 
    loadChildren: () => import('./pages/generic-page/generic-page.routes').then(m => m.default),
    canActivate: [AuthGuard]
  },
];
