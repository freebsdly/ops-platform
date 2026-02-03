/**
 * 带权限的菜单配置示例
 * 
 * 在实际项目中，应该直接更新 menu.config.ts 文件
 * 这里提供一个示例，展示如何为每个菜单项添加权限配置
 */

export const EXAMPLE_PERMISSION_CONFIG = {
  // 配置管理模块权限配置示例
  configuration: [
    {
      key: 'CONFIG.CONFIG_MANAGEMENT',
      text: '配置管理',
      icon: 'database',
      open: true,
      children: [
        { 
          key: 'CONFIG.MODEL_MANAGEMENT', 
          text: '模型管理', 
          icon: 'appstore', 
          link: '/configuration/management/model',
          permission: { resource: 'configuration', action: 'read' },
          roles: ['admin', 'config_manager']
        },
        { 
          key: 'CONFIG.ATTRIBUTE_MANAGEMENT', 
          text: '属性管理', 
          icon: 'appstore', 
          link: '/configuration/management/attribute',
          permission: { resource: 'configuration', action: 'read' },
          roles: ['admin', 'config_manager']
        },
        { 
          key: 'CONFIG.RELATIONSHIP', 
          text: '关联关系', 
          icon: 'deployment-unit', 
          link: '/configuration/management/relationship',
          permission: { resource: 'configuration', action: 'read' },
          roles: ['admin', 'config_manager']
        },
      ],
    },
    {
      key: 'CONFIG.OPERATION_MANAGEMENT',
      text: '运营管理',
      icon: 'cluster',
      open: true,
      children: [
        { 
          key: 'CONFIG.CONFIG_COLLECTION', 
          text: '配置采集', 
          icon: 'cloud-download', 
          link: '/configuration/operation/collection',
          permission: { resource: 'configuration', action: 'manage' },
          roles: ['admin', 'config_manager']
        },
        { 
          key: 'CONFIG.CONFIG_AUDIT', 
          text: '配置审计', 
          icon: 'audit', 
          link: '/configuration/operation/audit',
          permission: { resource: 'configuration', action: 'audit' },
          roles: ['admin', 'config_manager']
        },
        { 
          key: 'CONFIG.CONFIG_CHANGE', 
          text: '配置变更', 
          icon: 'sync', 
          link: '/configuration/operation/config-change',
          permission: { resource: 'configuration', action: 'manage' },
          roles: ['admin', 'config_manager']
        },
      ],
    },
    {
      key: 'CONFIG.COLLABORATION',
      text: '协同赋能',
      icon: 'team',
      open: true,
      children: [
        { 
          key: 'CONFIG.TOPOLOGY_VISUALIZATION', 
          text: '拓扑可视化', 
          icon: 'global', 
          link: '/configuration/collaboration/topology',
          permission: { resource: 'collaboration', action: 'read' },
          roles: ['admin', 'config_manager']
        },
        { 
          key: 'CONFIG.API_MANAGEMENT', 
          text: 'API管理', 
          icon: 'api', 
          link: '/configuration/collaboration/api',
          permission: { resource: 'collaboration', action: 'manage' },
          roles: ['admin', 'config_manager']
        },
        { 
          key: 'CONFIG.COMPLIANCE_CHECK', 
          text: '合规检查', 
          icon: 'safety-certificate', 
          link: '/configuration/collaboration/compliance',
          permission: { resource: 'collaboration', action: 'audit' },
          roles: ['admin', 'config_manager']
        },
        { 
          key: 'CONFIG.DATA_ANALYSIS', 
          text: '数据分析', 
          icon: 'bar-chart', 
          link: '/configuration/collaboration/analysis',
          permission: { resource: 'collaboration', action: 'read' },
          roles: ['admin', 'config_manager']
        },
      ],
    },
  ],

  // 权限分类定义
  permissionCategories: {
    // 基础权限
    basic: {
      read: { resource: 'base', action: 'read' },
      write: { resource: 'base', action: 'write' },
    },
    // 管理权限
    management: {
      create: { resource: 'manage', action: 'create' },
      update: { resource: 'manage', action: 'update' },
      delete: { resource: 'manage', action: 'delete' },
    },
    // 审计权限
    audit: {
      view: { resource: 'audit', action: 'view' },
      export: { resource: 'audit', action: 'export' },
    },
  },

  // 角色权限映射
  rolePermissions: {
    admin: [
      { resource: 'configuration', action: 'read' },
      { resource: 'configuration', action: 'manage' },
      { resource: 'configuration', action: 'audit' },
      { resource: 'monitoring', action: 'read' },
      { resource: 'monitoring', action: 'manage' },
      { resource: 'monitoring', action: 'analyze' },
      { resource: 'incident', action: 'read' },
      { resource: 'incident', action: 'manage' },
      { resource: 'incident', action: 'resolve' },
      { resource: 'service', action: 'read' },
      { resource: 'service', action: 'manage' },
      { resource: 'service', action: 'process' },
    ],
    config_manager: [
      { resource: 'configuration', action: 'read' },
      { resource: 'configuration', action: 'manage' },
      { resource: 'configuration', action: 'audit' },
    ],
    monitor_operator: [
      { resource: 'monitoring', action: 'read' },
      { resource: 'monitoring', action: 'manage' },
      { resource: 'monitoring', action: 'analyze' },
    ],
    incident_responder: [
      { resource: 'incident', action: 'read' },
      { resource: 'incident', action: 'manage' },
      { resource: 'incident', action: 'resolve' },
    ],
    service_manager: [
      { resource: 'service', action: 'read' },
      { resource: 'service', action: 'manage' },
      { resource: 'service', action: 'process' },
    ],
  },
};

/**
 * 权限检查函数示例
 */
export function checkPermissionExample() {
  // 示例：检查用户是否有配置管理的读权限
  const userPermissions = [
    { resource: 'configuration', action: 'read' },
    { resource: 'configuration', action: 'write' },
  ];

  const requiredPermission = { resource: 'configuration', action: 'read' };
  
  const hasPermission = userPermissions.some(perm => 
    perm.resource === requiredPermission.resource &&
    perm.action.includes(requiredPermission.action)
  );

  console.log('权限检查结果:', hasPermission);
  return hasPermission;
}

/**
 * 菜单项权限验证函数
 */
export function validateMenuItemPermission(menuItem: any, userPermissions: any[], userRoles: string[]): boolean {
  // 检查角色权限
  if (menuItem.roles && menuItem.roles.length > 0) {
    const hasRole = menuItem.roles.some((role: string) => userRoles.includes(role));
    if (!hasRole) {
      return false;
    }
  }

  // 检查细粒度权限
  if (menuItem.permission) {
    const hasPermission = userPermissions.some(perm => 
      perm.resource === menuItem.permission.resource &&
      perm.action.includes(menuItem.permission.action)
    );
    if (!hasPermission) {
      return false;
    }
  }

  return true;
}

/**
 * 过滤菜单项函数
 */
export function filterMenuItemsByPermission(menuItems: any[], userPermissions: any[], userRoles: string[]): any[] {
  return menuItems
    .map(menuItem => {
      // 检查当前菜单项权限
      if (!validateMenuItemPermission(menuItem, userPermissions, userRoles)) {
        return null;
      }

      // 递归处理子菜单
      if (menuItem.children && menuItem.children.length > 0) {
        const filteredChildren = filterMenuItemsByPermission(menuItem.children, userPermissions, userRoles);
        if (filteredChildren.length === 0 && !menuItem.link) {
          // 如果所有子菜单都无权限，且当前菜单没有链接，则隐藏
          return null;
        }
        
        return {
          ...menuItem,
          children: filteredChildren
        };
      }

      return menuItem;
    })
    .filter(menuItem => menuItem !== null);
}