import { Routes } from '@angular/router';
import { MonitoringComponent } from './monitoring.component';
import { MonitoringPageComponent } from './components/monitoring-page.component';
import { AuthGuard } from '../../guards/auth.guard';

// 监控模块的子路由
export const MONITORING_ROUTES: Routes = [
  {
    path: '',
    component: MonitoringComponent,
    children: [
      // 基础管理子模块
      { path: 'management/object', component: MonitoringPageComponent, canActivate: [AuthGuard] },
      { path: 'management/collection', component: MonitoringPageComponent, canActivate: [AuthGuard] },
      { path: 'management/collector', component: MonitoringPageComponent, canActivate: [AuthGuard] },
      { path: 'management/storage', component: MonitoringPageComponent, canActivate: [AuthGuard] },
      { path: 'management/log', component: MonitoringPageComponent, canActivate: [AuthGuard] },
      { path: 'management/link', component: MonitoringPageComponent, canActivate: [AuthGuard] },
      { path: 'management/cloud', component: MonitoringPageComponent, canActivate: [AuthGuard] },
      
      // 运营管理子模块
      { path: 'operation/visualization', component: MonitoringPageComponent, canActivate: [AuthGuard] },
      { path: 'operation/rules', component: MonitoringPageComponent, canActivate: [AuthGuard] },
      { path: 'operation/convergence', component: MonitoringPageComponent, canActivate: [AuthGuard] },
      { path: 'operation/distribution', component: MonitoringPageComponent, canActivate: [AuthGuard] },
      { path: 'operation/alert-grading', component: MonitoringPageComponent, canActivate: [AuthGuard] },
      { path: 'operation/masking', component: MonitoringPageComponent, canActivate: [AuthGuard] },
      { path: 'operation/log-search', component: MonitoringPageComponent, canActivate: [AuthGuard] },
      { path: 'operation/tracing', component: MonitoringPageComponent, canActivate: [AuthGuard] },
      
      // 协同赋能子模块
      { path: 'collaboration/query', component: MonitoringPageComponent, canActivate: [AuthGuard] },
      { path: 'collaboration/analysis', component: MonitoringPageComponent, canActivate: [AuthGuard] },
      { path: 'collaboration/anomaly', component: MonitoringPageComponent, canActivate: [AuthGuard] },
      { path: 'collaboration/capacity', component: MonitoringPageComponent, canActivate: [AuthGuard] },
      { path: 'collaboration/availability', component: MonitoringPageComponent, canActivate: [AuthGuard] },
      { path: 'collaboration/dashboard', component: MonitoringPageComponent, canActivate: [AuthGuard] },
      
      // 默认重定向到监控对象
      { path: '', redirectTo: 'management/object', pathMatch: 'full' }
    ]
  }
];