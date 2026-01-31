export interface Permission {
  id: string;
  name: string;
  type: 'menu' | 'operation' | 'data';
  resource: string;      // 资源标识，如：'user', 'config', 'monitoring'
  action: string[];      // 操作类型，如：['read', 'create', 'update', 'delete']
  description?: string;
}

export interface Role {
  id: string;
  name: string;
  description?: string;
  permissions: string[]; // 权限ID列表
}