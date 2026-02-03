import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, BehaviorSubject, catchError, tap } from 'rxjs';
import { User } from '../types/user.interface';

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
          permissions: []
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
  getUsers(search?: string, page: number = 1, pageSize: number = 10): Observable<{
    users: User[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  }> {
    const params: any = { page: page.toString(), pageSize: pageSize.toString() };
    if (search) {
      params.search = search;
    }
    
    return this.http.get<{
      users: User[];
      total: number;
      page: number;
      pageSize: number;
      totalPages: number;
    }>(`${this.API_BASE_URL}/users`, { params });
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
  getUserPermissions(userId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.API_BASE_URL}/users/${userId}/permissions`);
  }
  
  /**
   * 检查用户权限
   */
  checkPermission(userId: number, permissionId: string): Observable<{
    hasPermission: boolean;
    user: { id: number; name: string };
    permissionId: string;
  }> {
    return this.http.post<{
      hasPermission: boolean;
      user: { id: number; name: string };
      permissionId: string;
    }>(`${this.API_BASE_URL}/permissions/check`, { userId, permissionId });
  }
  
  /**
   * 获取系统模块列表
   */
  getSystemModules(): Observable<{
    modules: Array<{
      id: string;
      title: string;
      icon: string;
      color: string;
      defaultPath: string;
    }>;
  }> {
    return this.http.get<{
      modules: Array<{
        id: string;
        title: string;
        icon: string;
        color: string;
        defaultPath: string;
      }>;
    }>(`${this.API_BASE_URL}/system/modules`);
  }

  /**
   * 获取模块菜单
   */
  getModuleMenus(moduleId: string): Observable<{
    menus: Array<{
      id: string;
      title: string;
      icon: string;
      path: string;
      children?: Array<{
        id: string;
        title: string;
        icon: string;
        path: string;
      }>;
    }>;
  }> {
    return this.http.get<{
      menus: Array<{
        id: string;
        title: string;
        icon: string;
        path: string;
        children?: Array<{
          id: string;
          title: string;
          icon: string;
          path: string;
        }>;
      }>;
    }>(`${this.API_BASE_URL}/system/modules/${moduleId}/menus`);
  }

  /**
   * 获取可用的搜索标签
   */
  getSearchTags(): Observable<{
    tags: string[];
  }> {
    return this.http.get<{
      tags: string[];
    }>(`${this.API_BASE_URL}/system/search/tags`);
  }

  /**
   * 获取用户菜单
   */
  getUserMenus(userId?: number): Observable<any[]> {
    const params: any = {};
    if (userId) {
      params.userId = userId.toString();
    }
    
    return this.http.get<any[]>(`${this.API_BASE_URL}/user/menus`, { params });
  }
}