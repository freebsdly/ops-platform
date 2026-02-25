import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { isDevMode } from '@angular/core';
import { PermissionFacade } from '../stores/permission/permission.facade';
import { Router } from '@angular/router';

export interface AuditLog {
  timestamp: string;
  userId?: number;
  userRoles: string[];
  permission: string;
  resource: string;
  action: string;
  granted: boolean;
  context: {
    route?: string;
    component?: string;
    method?: string;
  };
}

@Injectable({ providedIn: 'root' })
export class PermissionAuditService {
  private http = inject(HttpClient);
  private permissionFacade = inject(PermissionFacade);
  private router = inject(Router);
  private auditLogs: AuditLog[] = [];
  private readonly MAX_LOGS = 100;

  logPermissionCheck(
    resource: string,
    action: string,
    granted: boolean,
    context?: Partial<AuditLog['context']>
  ): void {
    const log: AuditLog = {
      timestamp: new Date().toISOString(),
      userId: this.permissionFacade.user()?.id,
      userRoles: this.permissionFacade.userRoles(),
      permission: `${resource}:${action}`,
      resource,
      action,
      granted,
      context: {
        route: this.router.url,
        ...context
      }
    };

    this.addToLogs(log);
    this.sendToBackend(log);
  }

  logRouteAccess(route: string, granted: boolean): void {
    const log: AuditLog = {
      timestamp: new Date().toISOString(),
      userId: this.permissionFacade.user()?.id,
      userRoles: this.permissionFacade.userRoles(),
      permission: `route:${route}`,
      resource: 'route',
      action: 'access',
      granted,
      context: {
        route
      }
    };

    this.addToLogs(log);
    this.sendToBackend(log);
  }

  logRoleCheck(roleId: string, granted: boolean, context?: Partial<AuditLog['context']>): void {
    const log: AuditLog = {
      timestamp: new Date().toISOString(),
      userId: this.permissionFacade.user()?.id,
      userRoles: this.permissionFacade.userRoles(),
      permission: `role:${roleId}`,
      resource: 'role',
      action: 'check',
      granted,
      context: {
        route: this.router.url,
        ...context
      }
    };

    this.addToLogs(log);
    this.sendToBackend(log);
  }

  getAuditLogs(): AuditLog[] {
    return [...this.auditLogs];
  }

  exportAuditLogs(): string {
    return JSON.stringify(this.auditLogs, null, 2);
  }

  clearAuditLogs(): void {
    this.auditLogs = [];
  }

  private addToLogs(log: AuditLog): void {
    this.auditLogs.push(log);
    if (this.auditLogs.length > this.MAX_LOGS) {
      this.auditLogs.shift();
    }
  }

  private sendToBackend(log: AuditLog): void {
    if (!isDevMode()) {
      this.http.post('/api/audit/permissions', log)
        .pipe(catchError(() => of(null)))
        .subscribe();
    } else {
      console.log('[PermissionAudit]', log);
    }
  }
}
