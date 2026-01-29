// 根据菜单配置生成路由配置的工具
import { MENUS_CONFIG } from '../../config/menu.config';
import { GenericPageComponent } from './generic-pag';

// 收集所有菜单链接的函数
export function getAllMenuLinks(): string[] {
  const links: string[] = [];

  Object.values(MENUS_CONFIG).forEach(moduleMenus => {
    moduleMenus.forEach(menu => {
      if (menu.link) {
        links.push(menu.link);
      }
      if (menu.children) {
        menu.children.forEach(child => {
          if (child.link) {
            links.push(child.link);
          }
        });
      }
    });
  });

  return links;
}

// 生成路由配置的函数
export function generateMenuRoutes() {
  const links = getAllMenuLinks();

  // 为每个链接创建一个路由
  const routes = links.map(link => {
    return {
      path: link.substring(1), // 去掉开头的 '/'
      component: GenericPageComponent
    };
  });

  return routes;
}
