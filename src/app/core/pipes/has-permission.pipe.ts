import { Pipe, PipeTransform, inject } from '@angular/core';
import { PermissionFacade } from '../stores/permission/permission.facade';

@Pipe({
  name: 'hasPermission',
  standalone: true,
})
export class HasPermissionPipe implements PipeTransform {
  private permissionFacade = inject(PermissionFacade);

  transform(resource: string, action: string): boolean {
    return this.permissionFacade.hasPermission(resource, action);
  }
}