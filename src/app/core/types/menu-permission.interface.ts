export interface MenuPermission {
  menuId: string;      // 菜单ID，对应MENUS_CONFIG中的key或link
  resource: string;    // 资源标识，如：'configuration', 'monitoring'
  action: string[];    // 操作权限，如：['read', 'create', 'update', 'delete']
  requiredRoles?: string[]; // 需要的角色ID列表
}

export interface ApiMenuResponse {
  menus: Array<{
    id: string;        // 菜单ID
    key?: string;      // 国际化key
    path: string;      // 路由路径
    permission?: MenuPermission;
    visible: boolean;  // 是否可见
  }>;
}