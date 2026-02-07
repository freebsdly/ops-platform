import { Routes } from '@angular/router';
import { GenericPageComponent } from '../generic-page/generic-page.component';
import { AuthGuard } from '../../guards/auth.guard';

// 工作台模块的子路由
export const WORKBENCH_ROUTES: Routes = [
  {
    path: '',
    redirectTo: 'dashboard/overview',
    pathMatch: 'full'
  },
  // 工作台仪表板子模块
  { 
    path: 'dashboard/overview', 
    component: GenericPageComponent,
    canActivate: [AuthGuard],
    data: {
      permission: {
        resource: 'workbench',
        action: 'read'
      }
    }
  },
  { 
    path: 'dashboard/performance', 
    component: GenericPageComponent,
    canActivate: [AuthGuard],
    data: {
      permission: {
        resource: 'workbench',
        action: 'read'
      }
    }
  },
  { 
    path: 'dashboard/business', 
    component: GenericPageComponent,
    canActivate: [AuthGuard],
    data: {
      permission: {
        resource: 'workbench',
        action: 'read'
      }
    }
  },
  { 
    path: 'dashboard/operational', 
    component: GenericPageComponent,
    canActivate: [AuthGuard],
    data: {
      permission: {
        resource: 'workbench',
        action: 'read'
      }
    }
  },
  
  // 工作台分析子模块
  { 
    path: 'analytics/data', 
    component: GenericPageComponent,
    canActivate: [AuthGuard],
    data: {
      permission: {
        resource: 'workbench',
        action: 'read'
      }
    }
  },
  { 
    path: 'analytics/trend', 
    component: GenericPageComponent,
    canActivate: [AuthGuard],
    data: {
      permission: {
        resource: 'workbench',
        action: 'read'
      }
    }
  },
  { 
    path: 'analytics/comparative', 
    component: GenericPageComponent,
    canActivate: [AuthGuard],
    data: {
      permission: {
        resource: 'workbench',
        action: 'read'
      }
    }
  },
  { 
    path: 'analytics/root-cause', 
    component: GenericPageComponent,
    canActivate: [AuthGuard],
    data: {
      permission: {
        resource: 'workbench',
        action: 'read'
      }
    }
  },
  
  // 工作台管理子模块
  { 
    path: 'management/customization', 
    component: GenericPageComponent,
    canActivate: [AuthGuard],
    data: {
      permission: {
        resource: 'workbench',
        action: 'manage'
      }
    }
  },
  { 
    path: 'management/widget', 
    component: GenericPageComponent,
    canActivate: [AuthGuard],
    data: {
      permission: {
        resource: 'workbench',
        action: 'manage'
      }
    }
  },
  { 
    path: 'management/datasource', 
    component: GenericPageComponent,
    canActivate: [AuthGuard],
    data: {
      permission: {
        resource: 'workbench',
        action: 'manage'
      }
    }
  },
  { 
    path: 'management/report', 
    component: GenericPageComponent,
    canActivate: [AuthGuard],
    data: {
      permission: {
        resource: 'workbench',
        action: 'manage'
      }
    }
  },
  
  // 默认重定向到概览仪表板
  { path: '**', redirectTo: 'dashboard/overview' }
];