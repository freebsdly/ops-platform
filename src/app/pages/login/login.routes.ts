import { Routes } from '@angular/router';
import { LoginComponent } from './login';
import { loginGuard } from '../../guards/login.guard';

export const LOGIN_ROUTES: Routes = [
  {
    path: '',
    component: LoginComponent,
    canActivate: [loginGuard],
  },
];
