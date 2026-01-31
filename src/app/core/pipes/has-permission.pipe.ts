import { Pipe, PipeTransform, inject } from '@angular/core';
import { PermissionService } from '../../services/permission.service';

@Pipe({
  name: 'hasPermission',
  standalone: true,
})
export class HasPermissionPipe implements PipeTransform {
  private permissionService = inject(PermissionService);

  transform(resource: string, action: string): boolean {
    return this.permissionService.hasPermission(resource, action);
  }
}