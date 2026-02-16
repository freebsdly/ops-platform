/**
 * 统一 API 响应格式
 */
export interface ApiResponse<T = any> {
  code: number;
  message: string;
  data: T;
}

/**
 * 用户列表响应
 */
export interface UsersListResponse {
  users: Array<{
    id: number;
    username: string;
    email: string;
    name: string;
    avatar: string;
    roles: string[];
    permissions?: any[];
    menuPermissions?: any[];
  }>;
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

/**
 * 路由权限检查响应
 */
export interface RoutePermissionCheckResponse {
  hasPermission: boolean;
  requiredPermission?: {
    menuId: string;
    resource: string;
    action: string[];
    requiredRoles?: string[];
  };
  userPermission?: {
    menuId: string;
    resource: string;
    action: string[];
    requiredRoles?: string[];
  };
}

/**
 * 批量路由权限检查响应
 */
export interface BatchRoutePermissionCheckResponse {
  results: Array<{
    routePath: string;
    hasPermission: boolean;
  }>;
}

/**
 * 权限检查响应
 */
export interface PermissionCheckResponse {
  hasPermission: boolean;
  user: {
    id: number;
    name: string;
  };
  permissionId: string;
}

/**
 * 系统模块信息
 */
export interface SystemModuleInfo {
  id: string;
  title: string;
  icon: string;
  color: string;
  defaultPath: string;
}

/**
 * 系统模块列表响应
 */
export interface SystemModulesResponse {
  modules: SystemModuleInfo[];
}

/**
 * 菜单项信息
 */
export interface ModuleMenuItem {
  id: string;
  title: string;
  icon: string;
  path: string;
  children?: ModuleMenuItem[];
}

/**
 * 模块菜单响应
 */
export interface ModuleMenusResponse {
  menus: ModuleMenuItem[];
}

/**
 * 搜索标签响应
 */
export interface SearchTagsResponse {
  tags: string[];
}

/**
 * 用户菜单项（旧接口）
 */
export interface UserMenuItem {
  id: string;
  title: string;
  icon: string;
  path: string;
  order: number;
  enabled: boolean;
}

/**
 * 应用配置响应
 */
export interface AppConfigResponse {
  version: string;
  environment: string;
  apiUrl: string;
  features: Record<string, boolean>;
}

/**
 * 配置验证响应
 */
export interface ConfigValidationResponse {
  valid: boolean;
  errors: string[];
}
