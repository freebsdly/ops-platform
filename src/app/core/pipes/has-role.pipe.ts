import { Pipe, PipeTransform, inject } from '@angular/core';
import { PermissionService } from '../../services/permission.service';

@Pipe({
  name: 'hasRole',
  standalone: true,
})
export class HasRolePipe implements PipeTransform {
  private permissionService = inject(PermissionService);

  transform(roleId: string): boolean {
    return this.permissionService.hasRole(roleId);
  }
}