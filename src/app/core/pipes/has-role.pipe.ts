import { Pipe, PipeTransform, inject } from '@angular/core';
import { PermissionFacade } from '../stores/permission/permission.facade';

@Pipe({
  name: 'hasRole',
  standalone: true,
})
export class HasRolePipe implements PipeTransform {
  private permissionFacade = inject(PermissionFacade);

  transform(roleId: string): boolean {
    return this.permissionFacade.hasRole(roleId);
  }
}