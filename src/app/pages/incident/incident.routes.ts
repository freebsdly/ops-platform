import { Routes } from '@angular/router';
import { IncidentComponent } from './incident.component';
import { IncidentPageComponent } from './components/incident-page.component';

// 事件模块的子路由
export const INCIDENT_ROUTES: Routes = [
  {
    path: '',
    component: IncidentComponent,
    children: [
      // 基础管理子模块
      { path: 'management/aggregation', component: IncidentPageComponent },
      { path: 'management/event-grading', component: IncidentPageComponent },
      { path: 'management/ledger', component: IncidentPageComponent },
      { path: 'management/oncall', component: IncidentPageComponent },
      { path: 'management/classification', component: IncidentPageComponent },
      { path: 'management/handover', component: IncidentPageComponent },
      { path: 'management/silence', component: IncidentPageComponent },
      
      // 运营管理子模块
      { path: 'operation/response', component: IncidentPageComponent },
      { path: 'operation/handling', component: IncidentPageComponent },
      { path: 'operation/recovery', component: IncidentPageComponent },
      { path: 'operation/problem', component: IncidentPageComponent },
      { path: 'operation/rca', component: IncidentPageComponent },
      { path: 'operation/change-association', component: IncidentPageComponent },
      { path: 'operation/plan', component: IncidentPageComponent },
      { path: 'operation/collaboration', component: IncidentPageComponent },
      
      // 协同赋能子模块
      { path: 'collaboration/review', component: IncidentPageComponent },
      { path: 'collaboration/statistics', component: IncidentPageComponent },
      { path: 'collaboration/knowledge', component: IncidentPageComponent },
      { path: 'collaboration/standard', component: IncidentPageComponent },
      { path: 'collaboration/drill', component: IncidentPageComponent },
      { path: 'collaboration/analysis', component: IncidentPageComponent },
      { path: 'collaboration/intelligent', component: IncidentPageComponent },
      
      // 默认重定向到事件聚合
      { path: '', redirectTo: 'management/aggregation', pathMatch: 'full' }
    ]
  }
];