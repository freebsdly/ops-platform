import { Routes } from '@angular/router';
import { ServiceComponent } from './service.component';
import { ServicePageComponent } from './components/service-page.component';

// 服务模块的子路由
export const SERVICE_ROUTES: Routes = [
  {
    path: '',
    component: ServiceComponent,
    children: [
      // 基础管理子模块
      { path: 'management/desk', component: ServicePageComponent },
      { path: 'management/workorder', component: ServicePageComponent },
      { path: 'management/approval', component: ServicePageComponent },
      { path: 'management/catalog', component: ServicePageComponent },
      { path: 'management/dispatch', component: ServicePageComponent },
      { path: 'management/sla', component: ServicePageComponent },
      { path: 'management/consultation', component: ServicePageComponent },
      
      // 运营管理子模块
      { path: 'operation/execution', component: ServicePageComponent },
      { path: 'operation/archiving', component: ServicePageComponent },
      { path: 'operation/knowledge', component: ServicePageComponent },
      { path: 'operation/feedback', component: ServicePageComponent },
      { path: 'operation/sla-monitor', component: ServicePageComponent },
      { path: 'operation/slm', component: ServicePageComponent },
      { path: 'operation/bulk', component: ServicePageComponent },
      { path: 'operation/selfservice', component: ServicePageComponent },
      
      // 协同赋能子模块
      { path: 'collaboration/report', component: ServicePageComponent },
      { path: 'collaboration/statistics', component: ServicePageComponent },
      { path: 'collaboration/service-report', component: ServicePageComponent },
      { path: 'collaboration/cost', component: ServicePageComponent },
      { path: 'collaboration/analysis', component: ServicePageComponent },
      { path: 'collaboration/improvement', component: ServicePageComponent },
      
      // 默认重定向到服务台
      { path: '', redirectTo: 'management/desk', pathMatch: 'full' }
    ]
  }
];