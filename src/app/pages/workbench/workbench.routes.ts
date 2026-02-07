import { Routes } from '@angular/router';
import { AuthGuard } from '../../guards/auth.guard';
import { OverviewDashboardComponent } from './dashboard/overview/overview.component';

// 工作台模块的子路由
export const WORKBENCH_ROUTES: Routes = [
  {
    path: '',
    redirectTo: 'dashboard/overview',
    pathMatch: 'full'
  },
  // 工作台概览仪表板
  { 
    path: 'dashboard/overview', 
    component: OverviewDashboardComponent,
    canActivate: [AuthGuard],
    data: {
      permission: {
        resource: 'workbench',
        action: 'read'
      }
    }
  },
  
  // 默认重定向到概览仪表板
  { path: '**', redirectTo: 'dashboard/overview' }
];