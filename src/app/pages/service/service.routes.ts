import { Routes } from '@angular/router';
import { ServiceComponent } from './service.component';
import { ServicePageComponent } from './components/service-page.component';
import { AuthGuard } from '../../guards/auth.guard';

// 服务模块的子路由
export const SERVICE_ROUTES: Routes = [
  {
    path: '',
    component: ServiceComponent,
    children: [
      // 基础管理子模块
      { path: 'management/desk', component: ServicePageComponent, canActivate: [AuthGuard] },
      { path: 'management/workorder', component: ServicePageComponent, canActivate: [AuthGuard] },
      { path: 'management/approval', component: ServicePageComponent, canActivate: [AuthGuard] },
      { path: 'management/catalog', component: ServicePageComponent, canActivate: [AuthGuard] },
      { path: 'management/dispatch', component: ServicePageComponent, canActivate: [AuthGuard] },
      { path: 'management/sla', component: ServicePageComponent, canActivate: [AuthGuard] },
      { path: 'management/consultation', component: ServicePageComponent, canActivate: [AuthGuard] },
      
      // 运营管理子模块
      { path: 'operation/execution', component: ServicePageComponent, canActivate: [AuthGuard] },
      { path: 'operation/archiving', component: ServicePageComponent, canActivate: [AuthGuard] },
      { path: 'operation/knowledge', component: ServicePageComponent, canActivate: [AuthGuard] },
      { path: 'operation/feedback', component: ServicePageComponent, canActivate: [AuthGuard] },
      { path: 'operation/sla-monitor', component: ServicePageComponent, canActivate: [AuthGuard] },
      { path: 'operation/slm', component: ServicePageComponent, canActivate: [AuthGuard] },
      { path: 'operation/bulk', component: ServicePageComponent, canActivate: [AuthGuard] },
      { path: 'operation/selfservice', component: ServicePageComponent, canActivate: [AuthGuard] },
      
      // 协同赋能子模块
      { path: 'collaboration/report', component: ServicePageComponent, canActivate: [AuthGuard] },
      { path: 'collaboration/statistics', component: ServicePageComponent, canActivate: [AuthGuard] },
      { path: 'collaboration/service-report', component: ServicePageComponent, canActivate: [AuthGuard] },
      { path: 'collaboration/cost', component: ServicePageComponent, canActivate: [AuthGuard] },
      { path: 'collaboration/analysis', component: ServicePageComponent, canActivate: [AuthGuard] },
      { path: 'collaboration/improvement', component: ServicePageComponent, canActivate: [AuthGuard] },
      
      // 默认重定向到服务台
      { path: '', redirectTo: 'management/desk', pathMatch: 'full' }
    ]
  }
];