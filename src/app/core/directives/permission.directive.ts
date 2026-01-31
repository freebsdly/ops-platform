import { Directive, ElementRef, Input, OnInit, inject } from '@angular/core';
import { PermissionService } from '../../services/permission.service';

@Directive({
  selector: '[permission]',
  standalone: true,
})
export class PermissionDirective implements OnInit {
  private elementRef = inject(ElementRef);
  private permissionService = inject(PermissionService);

  @Input('permissionResource') resource!: string;
  @Input('permissionAction') action!: string;

  ngOnInit() {
    const hasPermission = this.permissionService.hasPermission(
      this.resource,
      this.action
    );
    
    if (!hasPermission) {
      // 隐藏元素
      this.elementRef.nativeElement.style.display = 'none';
    }
  }
}