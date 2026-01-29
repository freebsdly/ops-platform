import { Routes } from '@angular/router';
import { GenericPageComponent } from './generic-pag';
import { getAllMenuLinks } from './menu-routes.util';
import { AuthGuard } from '../../guards/auth.guard';

// 获取所有菜单链接
const menuLinks = getAllMenuLinks();

// 生成路由配置
const routes = menuLinks.map(link => ({
  path: link.substring(1), // 去掉开头的 '/'
  component: GenericPageComponent,
  canActivate: [AuthGuard]
}));

// 导出所有菜单路由
const allRoutes: Routes = [
  ...routes
];

export default allRoutes;
