import { http, HttpResponse } from 'msw';
import { User } from '../../app/core/types/user.interface';
import { Permission } from '../../app/core/types/permission.interface';

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
    
    if (!user || password !== 'password123') { // 简单密码验证
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
  })
];