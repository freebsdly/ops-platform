import { Routes } from '@angular/router';
import { MonitoringComponent } from './monitoring.component';
import { MonitoringPageComponent } from './components/monitoring-page.component';

// 监控模块的子路由
export const MONITORING_ROUTES: Routes = [
  {
    path: '',
    component: MonitoringComponent,
    children: [
      // 基础管理子模块
      { path: 'management/object', component: MonitoringPageComponent },
      { path: 'management/collection', component: MonitoringPageComponent },
      { path: 'management/collector', component: MonitoringPageComponent },
      { path: 'management/storage', component: MonitoringPageComponent },
      { path: 'management/log', component: MonitoringPageComponent },
      { path: 'management/link', component: MonitoringPageComponent },
      { path: 'management/cloud', component: MonitoringPageComponent },
      
      // 运营管理子模块
      { path: 'operation/visualization', component: MonitoringPageComponent },
      { path: 'operation/rules', component: MonitoringPageComponent },
      { path: 'operation/convergence', component: MonitoringPageComponent },
      { path: 'operation/distribution', component: MonitoringPageComponent },
      { path: 'operation/alert-grading', component: MonitoringPageComponent },
      { path: 'operation/masking', component: MonitoringPageComponent },
      { path: 'operation/log-search', component: MonitoringPageComponent },
      { path: 'operation/tracing', component: MonitoringPageComponent },
      
      // 协同赋能子模块
      { path: 'collaboration/query', component: MonitoringPageComponent },
      { path: 'collaboration/analysis', component: MonitoringPageComponent },
      { path: 'collaboration/anomaly', component: MonitoringPageComponent },
      { path: 'collaboration/capacity', component: MonitoringPageComponent },
      { path: 'collaboration/availability', component: MonitoringPageComponent },
      { path: 'collaboration/dashboard', component: MonitoringPageComponent },
      
      // 默认重定向到监控对象
      { path: '', redirectTo: 'management/object', pathMatch: 'full' }
    ]
  }
];