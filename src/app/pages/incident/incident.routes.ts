import { Routes } from '@angular/router';
import { IncidentComponent } from './incident.component';
import { IncidentPageComponent } from './components/incident-page.component';
import { AuthGuard } from '../../guards/auth.guard';

// 事件模块的子路由
export const INCIDENT_ROUTES: Routes = [
  {
    path: '',
    component: IncidentComponent,
    children: [
      // 基础管理子模块
      { path: 'management/aggregation', component: IncidentPageComponent, canActivate: [AuthGuard] },
      { path: 'management/event-grading', component: IncidentPageComponent, canActivate: [AuthGuard] },
      { path: 'management/ledger', component: IncidentPageComponent, canActivate: [AuthGuard] },
      { path: 'management/oncall', component: IncidentPageComponent, canActivate: [AuthGuard] },
      { path: 'management/classification', component: IncidentPageComponent, canActivate: [AuthGuard] },
      { path: 'management/handover', component: IncidentPageComponent, canActivate: [AuthGuard] },
      { path: 'management/silence', component: IncidentPageComponent, canActivate: [AuthGuard] },
      
      // 运营管理子模块
      { path: 'operation/response', component: IncidentPageComponent, canActivate: [AuthGuard] },
      { path: 'operation/handling', component: IncidentPageComponent, canActivate: [AuthGuard] },
      { path: 'operation/recovery', component: IncidentPageComponent, canActivate: [AuthGuard] },
      { path: 'operation/problem', component: IncidentPageComponent, canActivate: [AuthGuard] },
      { path: 'operation/rca', component: IncidentPageComponent, canActivate: [AuthGuard] },
      { path: 'operation/change-association', component: IncidentPageComponent, canActivate: [AuthGuard] },
      { path: 'operation/plan', component: IncidentPageComponent, canActivate: [AuthGuard] },
      { path: 'operation/collaboration', component: IncidentPageComponent, canActivate: [AuthGuard] },
      
      // 协同赋能子模块
      { path: 'collaboration/review', component: IncidentPageComponent, canActivate: [AuthGuard] },
      { path: 'collaboration/statistics', component: IncidentPageComponent, canActivate: [AuthGuard] },
      { path: 'collaboration/knowledge', component: IncidentPageComponent, canActivate: [AuthGuard] },
      { path: 'collaboration/standard', component: IncidentPageComponent, canActivate: [AuthGuard] },
      { path: 'collaboration/drill', component: IncidentPageComponent, canActivate: [AuthGuard] },
      { path: 'collaboration/analysis', component: IncidentPageComponent, canActivate: [AuthGuard] },
      { path: 'collaboration/intelligent', component: IncidentPageComponent, canActivate: [AuthGuard] },
      
      // 默认重定向到事件聚合
      { path: '', redirectTo: 'management/aggregation', pathMatch: 'full' }
    ]
  }
];