import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: '/welcome' },
  { 
    path: '', 
    loadChildren: () => import('./pages/generic-page/generic-page.routes').then(m => m.default)
  },
];
