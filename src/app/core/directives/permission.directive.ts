import { Directive, ElementRef, Input, OnInit, inject } from '@angular/core';
import { PermissionFacade } from '../stores/permission/permission.facade';

@Directive({
  selector: '[permission]',
  standalone: true,
})
export class PermissionDirective implements OnInit {
  private elementRef = inject(ElementRef);
  private permissionFacade = inject(PermissionFacade);

  @Input('permissionResource') resource!: string;
  @Input('permissionAction') action!: string;

  ngOnInit() {
    const hasPermission = this.permissionFacade.hasPermission(
      this.resource,
      this.action
    );

    if (!hasPermission) {
      // 隐藏元素
      this.elementRef.nativeElement.style.display = 'none';
    }
  }
}