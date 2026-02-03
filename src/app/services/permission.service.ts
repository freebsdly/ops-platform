import { Injectable, inject } from '@angular/core';
import { Observable, of, BehaviorSubject } from 'rxjs';
import { delay, catchError } from 'rxjs/operators';
import { Permission } from '../core/types/permission.interface';
import { User } from '../core/types/user.interface';
import { UserApiService } from '../core/services/user-api.service';

export interface PermissionCheck {
  resource: string;
  action: string;
}

@Injectable({
  providedIn: 'root',
})
export class PermissionService {
  private userApiService = inject(UserApiService);
  private currentPermissions: Permission[] = [];
  private permissionsSubject = new BehaviorSubject<Permission[]>([]);

  readonly permissionsChanged$ = this.permissionsSubject.asObservable();

  /**
   * 获取用户权限列表
   */
  getUserPermissions(userId: number): Observable<Permission[]> {
    return this.userApiService.getUserPermissions(userId).pipe(
      catchError(error => {
        console.error('获取用户权限失败:', error);
        // 返回空权限数组作为回退
        return of([]);
      })
    );
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
