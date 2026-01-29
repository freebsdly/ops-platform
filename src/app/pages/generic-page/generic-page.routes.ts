import { Routes } from '@angular/router';
import { GenericPageComponent } from './generic-page.component';
import { getAllMenuLinks } from './menu-routes.util';

// 获取所有菜单链接
const menuLinks = getAllMenuLinks();

// 生成路由配置
const routes = menuLinks.map(link => ({
  path: link.substring(1), // 去掉开头的 '/'
  component: GenericPageComponent
}));

// 添加欢迎页面路由
const allRoutes: Routes = [
  { path: 'welcome', component: GenericPageComponent },
  ...routes
];

export default allRoutes;
