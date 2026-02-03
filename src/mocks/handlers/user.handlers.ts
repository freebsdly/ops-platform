import { http, HttpResponse } from 'msw';
import { User } from '../../app/core/types/user.interface';
import { Permission } from '../../app/core/types/permission.interface';
import { MenuPermission } from '../../app/core/types/menu-permission.interface';
import { MODULES_CONFIG, MENUS_CONFIG, MenuItem } from '../../app/config/menu.config';

// 模拟用户数据
const mockUsers: User[] = [
  {
    id: 1,
    username: 'admin',
    email: 'admin@example.com',
    name: 'Admin User',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin',
    roles: ['admin', 'user'],
    permissions: [
    {
      id: 'dashboard:view',
      name: '查看仪表板',
      type: 'menu',
      resource: 'dashboard',
      action: ['read'],
      description: '允许访问仪表板页面'
    },
    {
      id: 'user:manage',
      name: '管理用户',
      type: 'operation',
      resource: 'user',
      action: ['create', 'read', 'update', 'delete'],
      description: '允许创建、编辑和删除用户'
    },
    {
      id: 'config:edit',
      name: '编辑配置',
      type: 'operation',
      resource: 'config',
      action: ['read', 'update'],
      description: '允许修改系统配置'
    },
    {
      id: 'report:view',
      name: '查看报告',
      type: 'menu',
      resource: 'report',
      action: ['read'],
      description: '允许查看系统报告'
    }
  ]
  },
  {
    id: 2,
    username: 'user',
    email: 'user@example.com',
    name: 'Demo User',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=user',
    roles: ['user'],
    permissions: [
      {
        id: 'dashboard:view',
        name: '查看仪表板',
        type: 'menu',
        resource: 'dashboard',
        action: ['read'],
        description: '允许访问仪表板页面'
      },
      {
        id: 'report:view',
        name: '查看报告',
        type: 'menu',
        resource: 'report',
        action: ['read'],
        description: '允许查看系统报告'
      }
    ]
  },
  {
    id: 3,
    username: 'viewer',
    email: 'viewer@example.com',
    name: 'Viewer User',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=viewer',
    roles: ['viewer'],
    permissions: [
      {
        id: 'dashboard:view',
        name: '查看仪表板',
        type: 'menu',
        resource: 'dashboard',
        action: ['read'],
        description: '允许访问仪表板页面'
      }
    ]
  }
];

// 模拟权限数据
const mockPermissions: Permission[] = [
  {
    id: 'dashboard:view',
    name: '查看仪表板',
    type: 'menu',
    resource: 'dashboard',
    action: ['read'],
    description: '允许访问仪表板页面'
  },
  {
    id: 'dashboard:edit',
    name: '编辑仪表板',
    type: 'operation',
    resource: 'dashboard',
    action: ['update'],
    description: '允许编辑仪表板布局'
  },
  {
    id: 'user:view',
    name: '查看用户',
    type: 'operation',
    resource: 'user',
    action: ['read'],
    description: '允许查看用户列表'
  },
  {
    id: 'user:manage',
    name: '管理用户',
    type: 'operation',
    resource: 'user',
    action: ['create', 'read', 'update', 'delete'],
    description: '允许创建、编辑和删除用户'
  },
  {
    id: 'role:view',
    name: '查看角色',
    type: 'operation',
    resource: 'role',
    action: ['read'],
    description: '允许查看角色列表'
  },
  {
    id: 'role:manage',
    name: '管理角色',
    type: 'operation',
    resource: 'role',
    action: ['create', 'read', 'update', 'delete'],
    description: '允许创建、编辑和删除角色'
  },
  {
    id: 'config:view',
    name: '查看配置',
    type: 'operation',
    resource: 'config',
    action: ['read'],
    description: '允许查看系统配置'
  },
  {
    id: 'config:edit',
    name: '编辑配置',
    type: 'operation',
    resource: 'config',
    action: ['read', 'update'],
    description: '允许修改系统配置'
  },
  {
    id: 'report:view',
    name: '查看报告',
    type: 'menu',
    resource: 'report',
    action: ['read'],
    description: '允许查看系统报告'
  },
  {
    id: 'report:generate',
    name: '生成报告',
    type: 'operation',
    resource: 'report',
    action: ['create'],
    description: '允许生成新的报告'
  }
];

// 模拟角色数据
const mockRoles = [
  { id: 'admin', name: '管理员', description: '拥有所有权限' },
  { id: 'user', name: '普通用户', description: '拥有基础权限' },
  { id: 'viewer', name: '查看者', description: '只拥有查看权限' }
];

// 辅助函数：检查用户是否有菜单访问权限
function checkMenuAccess(user: User, menuItem: MenuItem): boolean {
  // 如果没有权限要求，允许访问
  if (!menuItem.permission && (!menuItem.roles || menuItem.roles.length === 0)) {
    return true;
  }

  // 检查角色权限
  if (menuItem.roles && menuItem.roles.length > 0) {
    const hasRole = menuItem.roles.some((role: string) => user.roles.includes(role));
    if (!hasRole) {
      return false;
    }
  }

  // 检查细粒度权限
  if (menuItem.permission) {
    const hasPermission = user.permissions?.some(permission => 
      permission.resource === menuItem.permission!.resource &&
      (Array.isArray(permission.action) 
        ? permission.action.includes(menuItem.permission!.action)
        : permission.action === menuItem.permission!.action)
    );
    if (!hasPermission) {
      return false;
    }
  }

  return true;
}

// 辅助函数：从路径中提取资源标识
function extractResourceFromPath(path: string): string {
  // 从路径中提取资源，如：/configuration/management/model -> configuration
  const parts = path.split('/').filter(part => part.length > 0);
  return parts[0] || 'unknown';
}

// 辅助函数：根据路由路径查找菜单项
function findMenuByPath(routePath: string): MenuItem | null {
  for (const menus of Object.values(MENUS_CONFIG)) {
    const findMenu = (menuList: MenuItem[]): MenuItem | null => {
      for (const menu of menuList) {
        if (menu.link && menu.link === routePath) {
          return menu;
        }
        if (menu.children && menu.children.length > 0) {
          const found = findMenu(menu.children);
          if (found) {
            return found;
          }
        }
      }
      return null;
    };
    
    const found = findMenu(menus);
    if (found) {
      return found;
    }
  }
  return null;
}

// 模拟当前登录用户
let currentUser = mockUsers[0];

export const userHandlers = [
  // 获取当前用户信息
  http.get('/api/user/me', () => {
    return HttpResponse.json(currentUser);
  }),

  // 用户登录
  http.post('/api/auth/login', async ({ request }) => {
    const { username, password } = await request.json() as { username: string, password: string };

    // 模拟登录验证
    const user = mockUsers.find(u => u.username === username);

    if (!user) { // 简单密码验证
      return HttpResponse.json(
        { error: '用户名或密码错误' },
        { status: 401 }
      );
    }

    // 更新当前用户
    currentUser = user;

    // 生成模拟token
    const token = `mock_jwt_token_${Date.now()}_${user.id}`;

    return HttpResponse.json({
      user,
      token
    });
  }),

  // 用户登出
  http.post('/api/auth/logout', () => {
    currentUser = mockUsers[0]; // 重置为默认用户
    return HttpResponse.json({ success: true });
  }),

  // 获取用户列表
  http.get('/api/users', ({ request }) => {
    const url = new URL(request.url);
    const search = url.searchParams.get('search') || '';
    const page = parseInt(url.searchParams.get('page') || '1');
    const pageSize = parseInt(url.searchParams.get('pageSize') || '10');

    // 模拟搜索
    let filteredUsers = mockUsers;
    if (search) {
      filteredUsers = mockUsers.filter(user =>
        user.name.toLowerCase().includes(search.toLowerCase()) ||
        user.username.toLowerCase().includes(search.toLowerCase()) ||
        user.email.toLowerCase().includes(search.toLowerCase())
      );
    }

    // 模拟分页
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedUsers = filteredUsers.slice(startIndex, endIndex);

    return HttpResponse.json({
      users: paginatedUsers,
      total: filteredUsers.length,
      page,
      pageSize,
      totalPages: Math.ceil(filteredUsers.length / pageSize)
    });
  }),

  // 获取单个用户信息
  http.get('/api/users/:id', ({ params }) => {
    const id = parseInt(params['id'] as string);
    const user = mockUsers.find(u => u.id === id);

    if (!user) {
      return HttpResponse.json(
        { error: '用户不存在' },
        { status: 404 }
      );
    }

    return HttpResponse.json(user);
  }),

  // 更新用户信息
  http.put('/api/users/:id', async ({ params, request }) => {
    const id = parseInt(params['id'] as string);
    const userIndex = mockUsers.findIndex(u => u.id === id);

    if (userIndex === -1) {
      return HttpResponse.json(
        { error: '用户不存在' },
        { status: 404 }
      );
    }

    const updates = await request.json() as Partial<User>;

    // 更新用户信息
    mockUsers[userIndex] = {
      ...mockUsers[userIndex],
      ...updates
    };

    // 如果更新的是当前用户，同步更新
    if (currentUser.id === id) {
      currentUser = mockUsers[userIndex];
    }

    return HttpResponse.json(mockUsers[userIndex]);
  }),

  // 获取用户权限列表
  http.get('/api/users/:id/permissions', ({ params }) => {
    const id = parseInt(params['id'] as string);
    const user = mockUsers.find(u => u.id === id);

    if (!user) {
      return HttpResponse.json(
        { error: '用户不存在' },
        { status: 404 }
      );
    }

    return HttpResponse.json(user.permissions);
  }),

  // 检查用户权限
  http.post('/api/permissions/check', async ({ request }) => {
    const { userId, permissionId } = await request.json() as { userId: number, permissionId: string };
    const user = mockUsers.find(u => u.id === userId);

    if (!user) {
      return HttpResponse.json(
        { error: '用户不存在' },
        { status: 404 }
      );
    }

    const hasPermission = user.permissions.some(p => p.id === permissionId);

    return HttpResponse.json({
      hasPermission,
      user: {
        id: user.id,
        name: user.name
      },
      permissionId
    });
  }),

  // 获取所有权限列表
  http.get('/api/permissions', () => {
    return HttpResponse.json(mockPermissions);
  }),

  // 获取所有角色列表
  http.get('/api/roles', () => {
    return HttpResponse.json(mockRoles);
  }),

  // 获取用户菜单
  http.get('/api/user/menus', ({ request }) => {
    const url = new URL(request.url);
    const userId = url.searchParams.get('userId') || '1';

    // 根据用户角色返回不同的菜单
    const user = mockUsers.find(u => u.id === parseInt(userId)) || mockUsers[0];

    const baseMenus = [
      {
        id: 'dashboard',
        title: '仪表板',
        icon: 'dashboard',
        path: '/dashboard',
        order: 1,
        enabled: user.permissions.some(p => p.id === 'dashboard:view')
      }
    ];

    if (user.roles.includes('admin')) {
      return HttpResponse.json([
        ...baseMenus,
        {
          id: 'users',
          title: '用户管理',
          icon: 'user',
          path: '/users',
          order: 2,
          enabled: user.permissions.some(p => p.id === 'user:manage')
        },
        {
          id: 'roles',
          title: '角色管理',
          icon: 'team',
          path: '/roles',
          order: 3,
          enabled: user.permissions.some(p => p.id === 'role:manage')
        },
        {
          id: 'config',
          title: '系统配置',
          icon: 'setting',
          path: '/config',
          order: 4,
          enabled: user.permissions.some(p => p.id === 'config:edit')
        },
        {
          id: 'reports',
          title: '系统报告',
          icon: 'file-text',
          path: '/reports',
          order: 5,
          enabled: user.permissions.some(p => p.id === 'report:view')
        }
      ]);
    } else if (user.roles.includes('user')) {
      return HttpResponse.json([
        ...baseMenus,
        {
          id: 'reports',
          title: '系统报告',
          icon: 'file-text',
          path: '/reports',
          order: 2,
          enabled: user.permissions.some(p => p.id === 'report:view')
        }
      ]);
    } else {
      return HttpResponse.json(baseMenus);
    }
  }),

  // 获取可用的搜索标签
  http.get('/api/system/search/tags', () => {
    return HttpResponse.json({
      tags: [
        'urgent',
        'documentation',
        'bug',
        'feature',
        'enhancement',
        'design',
        'backend',
        'frontend'
      ]
    });
  }),

  // 获取系统模块列表
  http.get('/api/system/modules', () => {
    return HttpResponse.json({
      modules: MODULES_CONFIG.map(module => ({
        id: module.id,
        title: module.title,
        icon: module.icon,
        color: module.color,
        defaultPath: module.defaultPath
      }))
    });
  }),

  // 获取指定模块的菜单
  http.get('/api/system/modules/:moduleId/menus', ({ params }) => {
    const moduleId = params['moduleId'] as string;
    const moduleMenus = MENUS_CONFIG[moduleId];

    if (!moduleMenus) {
      return HttpResponse.json(
        { error: '模块不存在' },
        { status: 404 }
      );
    }

    // 定义API响应类型
    type ApiMenuItem = {
      id: string;
      title: string;
      icon: string;
      path: string;
      children?: ApiMenuItem[];
    };

    // 将MenuItem格式转换为API响应格式
    const menus: ApiMenuItem[] = moduleMenus.map(menu => {
      const apiMenu: ApiMenuItem = {
        id: menu.key || menu.text,
        title: menu.text,
        icon: menu.icon,
        path: menu.link || `/${moduleId}/${menu.key?.toLowerCase() || menu.text.toLowerCase()}`
      };

      if (menu.children && menu.children.length > 0) {
        apiMenu.children = menu.children.map(child => ({
          id: child.key || child.text,
          title: child.text,
          icon: child.icon,
          path: child.link || `/${moduleId}/${child.key?.toLowerCase() || child.text.toLowerCase()}`
        }));
      }

      return apiMenu;
    });

    return HttpResponse.json({ menus });
  }),

  // 获取用户菜单权限列表
  http.get('/api/user/menu-permissions', ({ request }) => {
    const url = new URL(request.url);
    const userId = url.searchParams.get('userId') || '1';
    
    const user = mockUsers.find(u => u.id === parseInt(userId)) || mockUsers[0];
    
    // 根据用户权限和菜单配置生成菜单权限列表
    const menuPermissions: MenuPermission[] = [];
    
    // 检查每个模块的菜单配置
    Object.entries(MENUS_CONFIG).forEach(([moduleId, menus]) => {
      const flattenMenus = (menuList: MenuItem[], parentPath = ''): void => {
        menuList.forEach(menu => {
          if (menu.link) {
            // 检查用户是否有访问此菜单的权限
            const hasAccess = checkMenuAccess(user, menu);
            if (hasAccess) {
              menuPermissions.push({
                menuId: menu.key || menu.link,
                resource: moduleId,
                action: menu.permission?.action ? [menu.permission.action] : ['read'],
                requiredRoles: menu.roles
              });
            }
          }
          
          if (menu.children && menu.children.length > 0) {
            flattenMenus(menu.children, menu.link || '');
          }
        });
      };
      
      flattenMenus(menus);
    });
    
    return HttpResponse.json(menuPermissions);
  }),

  // 检查用户是否有特定路由的权限
  http.post('/api/permissions/check-route', async ({ request }) => {
    const { routePath, userId } = await request.json() as { routePath: string; userId?: number };
    
    const user = userId ? mockUsers.find(u => u.id === userId) : currentUser;
    if (!user) {
      return HttpResponse.json(
        { error: '用户不存在' },
        { status: 404 }
      );
    }
    
    // 查找匹配的路由对应的菜单项
    const matchingMenu = findMenuByPath(routePath);
    
    if (matchingMenu) {
      // 检查用户是否有访问此菜单的权限
      const hasPermission = checkMenuAccess(user, matchingMenu);
      const requiredPermission: MenuPermission = {
        menuId: matchingMenu.key || matchingMenu.link || '',
        resource: matchingMenu.permission?.resource || extractResourceFromPath(routePath),
        action: matchingMenu.permission?.action ? [matchingMenu.permission.action] : ['read']
      };
      
      return HttpResponse.json({
        hasPermission,
        requiredPermission: requiredPermission,
        userPermission: hasPermission ? requiredPermission : undefined
      });
    }
    
    // 如果没有找到对应的菜单配置，检查用户是否具有默认权限
    const hasDefaultPermission = user.roles.includes('admin') || 
                                 user.permissions.some(p => p.id.includes('default'));
    
    return HttpResponse.json({
      hasPermission: hasDefaultPermission,
      requiredPermission: {
        menuId: routePath,
        resource: extractResourceFromPath(routePath),
        action: ['read']
      },
      userPermission: hasDefaultPermission ? {
        menuId: routePath,
        resource: extractResourceFromPath(routePath),
        action: ['read']
      } : undefined
    });
  }),

  // 批量检查路由权限
  http.post('/api/permissions/check-batch-routes', async ({ request }) => {
    const { routes, userId } = await request.json() as { routes: string[]; userId?: number };
    
    const user = userId ? mockUsers.find(u => u.id === userId) : currentUser;
    if (!user) {
      return HttpResponse.json(
        { error: '用户不存在' },
        { status: 404 }
      );
    }
    
    const results = routes.map(routePath => {
      // 查找匹配的菜单项
      const matchingMenu = findMenuByPath(routePath);
      
      if (matchingMenu) {
        const hasPermission = checkMenuAccess(user, matchingMenu);
        return { routePath, hasPermission };
      }
      
      // 默认权限检查
      const hasDefaultPermission = user.roles.includes('admin') || 
                                   user.permissions.some(p => p.id.includes('default'));
      
      return { routePath, hasPermission: hasDefaultPermission };
    });
    
    return HttpResponse.json({ results });
  })
];
