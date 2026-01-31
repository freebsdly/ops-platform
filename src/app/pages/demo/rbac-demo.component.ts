import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzMessageService } from 'ng-zorro-antd/message';

import { AppState } from '../../core/types/app-state';
import { User } from '../../core/types/user.interface';
import * as AuthSelectors from '../../core/stores/auth/auth.selectors';
import { PermissionService } from '../../services/permission.service';
import { PermissionDirective } from '../../core/directives/permission.directive';
import { HasPermissionPipe } from '../../core/pipes/has-permission.pipe';
import { HasRolePipe } from '../../core/pipes/has-role.pipe';

@Component({
  selector: 'app-rbac-demo',
  standalone: true,
  imports: [
    CommonModule,
    NzButtonModule,
    PermissionDirective,
    HasPermissionPipe,
    HasRolePipe
  ],
  templateUrl: './rbac-demo.component.html',
  styleUrls: ['./rbac-demo.component.css']
})
export class RbacDemoComponent implements OnInit {
  private store = inject(Store<AppState>);
  private permissionService = inject(PermissionService);
  private message = inject(NzMessageService);

  user$: Observable<User | null>;
  permissionResults: Record<string, string> = {};

  constructor() {
    this.user$ = this.store.select(AuthSelectors.selectUser);
  }

  ngOnInit(): void {
    this.message.info('RBAC 演示组件已加载');
  }

  checkPermission(resource: string, action: string): void {
    const hasPermission = this.permissionService.hasPermission(resource, action);
    const resultKey = `${resource}_${action}`;
    this.permissionResults[resultKey] = hasPermission ? '✅ 有权限' : '❌ 无权限';
    
    if (hasPermission) {
      this.message.success(`您有 ${resource}.${action} 权限`);
    } else {
      this.message.warning(`您没有 ${resource}.${action} 权限`);
    }
  }

  onConfigRead(): void {
    this.message.success('配置读取操作成功执行');
  }

  onAdminAction(): void {
    this.message.success('管理员操作成功执行');
  }

  // 演示从Store获取权限
  getCurrentPermissions(): void {
    this.store.select(AuthSelectors.selectPermissions).subscribe(permissions => {
      this.message.info(`当前用户有 ${permissions.length} 个权限`);
    });
  }
}