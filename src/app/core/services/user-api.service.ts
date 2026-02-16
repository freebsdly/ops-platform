import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, BehaviorSubject, catchError, tap } from 'rxjs';
import { User } from '../types/user.interface';
import { MenuPermission, ApiMenuResponse } from '../types/menu-permission.interface';
import { Permission } from '../types/permission.interface';
import {
  UsersListResponse,
  RoutePermissionCheckResponse,
  BatchRoutePermissionCheckResponse,
  PermissionCheckResponse,
  SystemModulesResponse,
  ModuleMenusResponse,
  SearchTagsResponse,
  UserMenuItem
} from '../types/api-response.interface';

export interface AuthResponse {
  user: User;
  token: string;
}

@Injectable({
  providedIn: 'root'
})
export class UserApiService {
  private http = inject(HttpClient);
  private readonly API_BASE_URL = '/api';
  
  /**
   * 获取当前登录用户信息
   */
  getCurrentUser(): Observable<User> {
    console.log('UserApiService: 获取当前用户信息');
    return this.http.get<User>(`${this.API_BASE_URL}/user/me`).pipe(
      tap(user => console.log('UserApiService: 获取到用户:', user.name)),
      catchError(error => {
        console.error('UserApiService: 获取用户失败:', error);
        // 返回默认用户作为回退
        return of({
          id: 1,
          username: 'admin',
          email: 'admin@example.com',
          name: 'Admin User',
          avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin',
          roles: ['admin'],
          permissions: [],
          menuPermissions: []
        });
      })
    );
  }
  
  /**
   * 用户登录
   */
  login(username: string, password: string): Observable<AuthResponse> {
    console.log('UserApiService: 用户登录:', username);
    return this.http.post<AuthResponse>(`${this.API_BASE_URL}/auth/login`, {
      username,
      password
    }).pipe(
      tap(response => console.log('UserApiService: 登录成功:', response.user.name)),
      catchError(error => {
        console.error('UserApiService: 登录失败:', error);
        throw error;
      })
    );
  }
  
  /**
   * 用户登出
   */
  logout(): Observable<{ success: boolean }> {
    console.log('UserApiService: 用户登出');
    return this.http.post<{ success: boolean }>(`${this.API_BASE_URL}/auth/logout`, {}).pipe(
      tap(() => console.log('UserApiService: 登出成功')),
      catchError(error => {
        console.error('UserApiService: 登出失败:', error);
        // 即使API失败也返回成功，清除本地状态
        return of({ success: true });
      })
    );
  }
  
  /**
   * 获取用户列表
   */
  getUsers(search?: string, page: number = 1, pageSize: number = 10): Observable<UsersListResponse> {
    const params: any = { page: page.toString(), pageSize: pageSize.toString() };
    if (search) {
      params.search = search;
    }

    return this.http.get<UsersListResponse>(`${this.API_BASE_URL}/users`, { params });
  }
  
  /**
   * 获取单个用户
   */
  getUserById(id: number): Observable<User> {
    return this.http.get<User>(`${this.API_BASE_URL}/users/${id}`);
  }
  
  /**
   * 更新用户信息
   */
  updateUser(id: number, userData: Partial<User>): Observable<User> {
    return this.http.put<User>(`${this.API_BASE_URL}/users/${id}`, userData);
  }
  
  /**
   * 获取用户权限
   */
  getUserPermissions(userId: number): Observable<Permission[]> {
    return this.http.get<Permission[]>(`${this.API_BASE_URL}/users/${userId}/permissions`);
  }

  /**
   * 获取用户菜单权限
   */
  getUserMenuPermissions(userId?: number): Observable<MenuPermission[]> {
    const params: any = {};
    if (userId) {
      params.userId = userId.toString();
    }
    
    return this.http.get<MenuPermission[]>(`${this.API_BASE_URL}/user/menu-permissions`, { params });
  }

  /**
   * 获取用户可访问的菜单（带权限信息）
   */
  getUserAccessibleMenus(userId?: number): Observable<ApiMenuResponse> {
    const params: any = {};
    if (userId) {
      params.userId = userId.toString();
    }
    
    return this.http.get<ApiMenuResponse>(`${this.API_BASE_URL}/user/accessible-menus`, { params });
  }

  /**
   * 检查用户是否有特定路由的权限
   */
  checkRoutePermission(routePath: string, userId?: number): Observable<RoutePermissionCheckResponse> {
    const body: any = { routePath };
    if (userId) {
      body.userId = userId;
    }

    return this.http.post<RoutePermissionCheckResponse>(`${this.API_BASE_URL}/permissions/check-route`, body);
  }

  /**
   * 批量检查路由权限
   */
  checkBatchRoutePermissions(routes: string[], userId?: number): Observable<BatchRoutePermissionCheckResponse> {
    const body: any = { routes };
    if (userId) {
      body.userId = userId;
    }

    return this.http.post<BatchRoutePermissionCheckResponse>(`${this.API_BASE_URL}/permissions/check-batch-routes`, body);
  }

  /**
   * 检查用户权限
   */
  checkPermission(userId: number, permissionId: string): Observable<PermissionCheckResponse> {
    return this.http.post<PermissionCheckResponse>(`${this.API_BASE_URL}/permissions/check`, { userId, permissionId });
  }
  
  /**
   * 获取系统模块列表
   */
  getSystemModules(): Observable<SystemModulesResponse> {
    return this.http.get<SystemModulesResponse>(`${this.API_BASE_URL}/system/modules`);
  }

  /**
   * 获取模块菜单
   */
  getModuleMenus(moduleId: string): Observable<ModuleMenusResponse> {
    return this.http.get<ModuleMenusResponse>(`${this.API_BASE_URL}/system/modules/${moduleId}/menus`);
  }

  /**
   * 获取可用的搜索标签
   */
  getSearchTags(): Observable<SearchTagsResponse> {
    return this.http.get<SearchTagsResponse>(`${this.API_BASE_URL}/system/search/tags`);
  }

  /**
   * 获取用户菜单（旧接口，保持兼容）
   */
  getUserMenus(userId?: number): Observable<UserMenuItem[]> {
    const params: any = {};
    if (userId) {
      params.userId = userId.toString();
    }

    return this.http.get<UserMenuItem[]>(`${this.API_BASE_URL}/user/menus`, { params });
  }
}