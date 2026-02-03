import { Permission } from './permission.interface';
import { MenuPermission } from './menu-permission.interface';

export interface User {
  id: number;
  username: string;
  email: string;
  name: string;
  avatar?: string;
  roles: string[];          // 角色ID列表
  permissions: Permission[]; // 详细权限列表（从后端获取）
  menuPermissions?: MenuPermission[]; // 菜单权限列表
}