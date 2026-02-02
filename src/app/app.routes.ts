import { Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';
import { RootRedirectGuard } from './guards/root-redirect.guard';
import { EmptyComponent } from './components/empty.component';

/**
 * 主应用路由配置
 * 
 * 路由组织说明：
 * 1. 根路径重定向到适当页面（由RootRedirectGuard处理）
 * 2. 登录页面使用懒加载
 * 3. 各个功能模块使用懒加载并应用AuthGuard
 * 
 * 新增服务说明：
 * - RouteConfigService: 集中管理所有路由配置，用于Tab管理、菜单生成等
 * - RouteLoadingService: 路由加载状态管理，提供loading状态信号
 */
export const routes: Routes = [
  { 
    path: '', 
    pathMatch: 'full', 
    canActivate: [RootRedirectGuard],
    component: EmptyComponent
  },
  { 
    path: 'login', 
    loadChildren: () => import('./pages/login/login.routes').then(m => m.LOGIN_ROUTES) 
  },
  // 配置管理模块 - 懒加载
  { 
    path: 'configuration', 
    loadChildren: () => import('./pages/configuration/configuration.routes').then(m => m.CONFIGURATION_ROUTES),
    canActivate: [AuthGuard]
  },
  // 监控中心模块 - 懒加载
  { 
    path: 'monitoring', 
    loadChildren: () => import('./pages/monitoring/monitoring.routes').then(m => m.MONITORING_ROUTES),
    canActivate: [AuthGuard]
  },
  // 事件中心模块 - 懒加载
  { 
    path: 'incident', 
    loadChildren: () => import('./pages/incident/incident.routes').then(m => m.INCIDENT_ROUTES),
    canActivate: [AuthGuard]
  },
  // 服务中心模块 - 懒加载
  { 
    path: 'service', 
    loadChildren: () => import('./pages/service/service.routes').then(m => m.SERVICE_ROUTES),
    canActivate: [AuthGuard]
  },
  // 默认重定向到配置管理模块
  { 
    path: '**', 
    redirectTo: '/configuration/management/model' 
  }
];
