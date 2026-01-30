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
 * 3. 主应用区域使用懒加载并应用AuthGuard
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
  { 
    path: '', 
    loadChildren: () => import('./pages/generic-page/generic-page.routes').then(m => m.default),
    canActivate: [AuthGuard]
  },
];
