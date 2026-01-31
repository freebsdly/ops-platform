import { Injectable, inject } from '@angular/core';
import { Observable, of, BehaviorSubject } from 'rxjs';
import { delay } from 'rxjs/operators';
import { Permission } from '../core/types/permission.interface';
import { User } from '../core/types/user.interface';

export interface PermissionCheck {
  resource: string;
  action: string;
}

@Injectable({
  providedIn: 'root',
})
export class PermissionService {
  private currentPermissions: Permission[] = [];
  private permissionsSubject = new BehaviorSubject<Permission[]>([]);
  
  readonly permissionsChanged$ = this.permissionsSubject.asObservable();

  /**
   * 获取用户权限列表（模拟API调用）
   * 实际项目中应替换为真实的API调用
   */
  getUserPermissions(userId: number): Observable<Permission[]> {
    // 模拟API调用延迟
    return new Observable<Permission[]>((observer) => {
      setTimeout(() => {
        // 模拟权限数据
        const mockPermissions: Permission[] = [
          {
            id: 'config_read',
            name: '配置读取',
            type: 'menu',
            resource: 'configuration',
            action: ['read'],
            description: '查看配置管理模块'
          },
          {
            id: 'config_write',
            name: '配置写入',
            type: 'operation',
            resource: 'configuration',
            action: ['create', 'update'],
            description: '创建和修改配置'
          },
          {
            id: 'monitoring_view',
            name: '监控查看',
            type: 'menu',
            resource: 'monitoring',
            action: ['read'],
            description: '查看监控模块'
          },
          {
            id: 'user_manage',
            name: '用户管理',
            type: 'operation',
            resource: 'user',
            action: ['read', 'create', 'update', 'delete'],
            description: '管理用户信息'
          }
        ];
        
        this.currentPermissions = mockPermissions;
        this.permissionsSubject.next(mockPermissions);
        observer.next(mockPermissions);
        observer.complete();
      }, 300);
    });
  }

  /**
   * 设置当前用户权限（用于从Store同步）
   */
  setPermissions(permissions: Permission[]): void {
    this.currentPermissions = permissions;
    this.permissionsSubject.next(permissions);
  }

  /**
   * 检查是否拥有指定权限
   */
  hasPermission(resource: string, action: string): boolean {
    return this.currentPermissions.some(permission => 
      permission.resource === resource && 
      permission.action.includes(action)
    );
  }

  /**
   * 检查是否拥有指定角色
   */
  hasRole(roleId: string, user?: User): boolean {
    const targetUser = user || this.getCurrentUserFromLocalStorage();
    return targetUser?.roles.includes(roleId) || false;
  }

  /**
   * 检查是否拥有任意一个指定权限
   */
  hasAnyPermission(permissions: PermissionCheck[]): boolean {
    return permissions.some(({ resource, action }) => 
      this.hasPermission(resource, action)
    );
  }

  /**
   * 检查是否拥有所有指定权限
   */
  hasAllPermissions(permissions: PermissionCheck[]): boolean {
    return permissions.every(({ resource, action }) => 
      this.hasPermission(resource, action)
    );
  }

  /**
   * 获取指定资源的所有权限
   */
  getResourcePermissions(resource: string): Permission[] {
    return this.currentPermissions.filter(
      permission => permission.resource === resource
    );
  }

  /**
   * 从localStorage获取当前用户（临时方案，实际应从Store获取）
   */
  private getCurrentUserFromLocalStorage(): User | null {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        return JSON.parse(userStr);
      } catch {
        return null;
      }
    }
    return null;
  }
}