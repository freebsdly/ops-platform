import { Routes } from '@angular/router';
import { ConfigurationComponent } from './configuration.component';
import { ConfigurationPageComponent } from './components/configuration-page.component';
import { PermissionGuard } from '../../guards/permission.guard';

// 配置模块的子路由
export const CONFIGURATION_ROUTES: Routes = [
  {
    path: '',
    component: ConfigurationComponent,
    children: [
      // 配置管理子模块 - 需要配置管理权限
      { 
        path: 'management/model', 
        component: ConfigurationPageComponent,
        canActivate: [PermissionGuard],
        data: {
          permission: {
            resource: 'configuration',
            action: 'read'
          }
        }
      },
      { 
        path: 'management/attribute', 
        component: ConfigurationPageComponent,
        canActivate: [PermissionGuard],
        data: {
          permission: {
            resource: 'configuration',
            action: 'read'
          }
        }
      },
      { 
        path: 'management/relationship', 
        component: ConfigurationPageComponent,
        canActivate: [PermissionGuard],
        data: {
          permission: {
            resource: 'configuration',
            action: 'read'
          }
        }
      },
      
      // 运营管理子模块 - 需要运营管理权限
      { 
        path: 'operation/collection', 
        component: ConfigurationPageComponent,
        canActivate: [PermissionGuard],
        data: {
          permission: {
            resource: 'configuration',
            action: 'manage'
          }
        }
      },
      { 
        path: 'operation/audit', 
        component: ConfigurationPageComponent,
        canActivate: [PermissionGuard],
        data: {
          permission: {
            resource: 'configuration',
            action: 'audit'
          }
        }
      },
      { 
        path: 'operation/config-change', 
        component: ConfigurationPageComponent,
        canActivate: [PermissionGuard],
        data: {
          permission: {
            resource: 'configuration',
            action: 'manage'
          }
        }
      },
      
      // 协同赋能子模块 - 需要协同权限
      { 
        path: 'collaboration/topology', 
        component: ConfigurationPageComponent,
        canActivate: [PermissionGuard],
        data: {
          permission: {
            resource: 'collaboration',
            action: 'read'
          }
        }
      },
      { 
        path: 'collaboration/api', 
        component: ConfigurationPageComponent,
        canActivate: [PermissionGuard],
        data: {
          permission: {
            resource: 'collaboration',
            action: 'manage'
          }
        }
      },
      { 
        path: 'collaboration/compliance', 
        component: ConfigurationPageComponent,
        canActivate: [PermissionGuard],
        data: {
          permission: {
            resource: 'collaboration',
            action: 'audit'
          }
        }
      },
      { 
        path: 'collaboration/analysis', 
        component: ConfigurationPageComponent,
        canActivate: [PermissionGuard],
        data: {
          permission: {
            resource: 'collaboration',
            action: 'read'
          }
        }
      },
      
      // 默认重定向到模型管理
      { path: '', redirectTo: 'management/model', pathMatch: 'full' }
    ]
  }
];