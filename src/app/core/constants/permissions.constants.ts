export enum PermissionResource {
  USER = 'user',
  CONFIG = 'config',
  MONITORING = 'monitoring',
  INCIDENT = 'incident',
  SERVICE = 'service',
  REPORT = 'report',
}

export enum PermissionAction {
  READ = 'read',
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  EXPORT = 'export',
  IMPORT = 'import',
  APPROVE = 'approve',
  REJECT = 'reject',
}

export const PERMISSIONS = {
  USER: {
    READ: 'user:read',
    CREATE: 'user:create',
    UPDATE: 'user:update',
    DELETE: 'user:delete',
    EXPORT: 'user:export',
  },
  CONFIG: {
    READ: 'config:read',
    MANAGE: 'config:manage',
  },
  MONITORING: {
    READ: 'monitoring:read',
    MANAGE: 'monitoring:manage',
  },
  INCIDENT: {
    READ: 'incident:read',
    CREATE: 'incident:create',
    UPDATE: 'incident:update',
    DELETE: 'incident:delete',
  },
  SERVICE: {
    READ: 'service:read',
    MANAGE: 'service:manage',
  },
  REPORT: {
    READ: 'report:read',
    CREATE: 'report:create',
    EXPORT: 'report:export',
  },
} as const;

export type PermissionId = string;

export const ROLES = {
  ADMIN: 'admin',
  MANAGER: 'manager',
  USER: 'user',
  GUEST: 'guest',
} as const;

export type RoleId = string;

export const ROLE_PERMISSIONS = {
  [ROLES.ADMIN]: [
    PERMISSIONS.USER.READ,
    PERMISSIONS.USER.CREATE,
    PERMISSIONS.USER.UPDATE,
    PERMISSIONS.USER.DELETE,
    PERMISSIONS.USER.EXPORT,
    PERMISSIONS.CONFIG.READ,
    PERMISSIONS.CONFIG.MANAGE,
    PERMISSIONS.MONITORING.READ,
    PERMISSIONS.MONITORING.MANAGE,
    PERMISSIONS.INCIDENT.READ,
    PERMISSIONS.INCIDENT.CREATE,
    PERMISSIONS.INCIDENT.UPDATE,
    PERMISSIONS.INCIDENT.DELETE,
    PERMISSIONS.SERVICE.READ,
    PERMISSIONS.SERVICE.MANAGE,
    PERMISSIONS.REPORT.READ,
    PERMISSIONS.REPORT.CREATE,
    PERMISSIONS.REPORT.EXPORT,
  ],
  [ROLES.MANAGER]: [
    PERMISSIONS.USER.READ,
    PERMISSIONS.USER.CREATE,
    PERMISSIONS.USER.UPDATE,
    PERMISSIONS.CONFIG.READ,
    PERMISSIONS.MONITORING.READ,
    PERMISSIONS.INCIDENT.READ,
    PERMISSIONS.INCIDENT.CREATE,
    PERMISSIONS.INCIDENT.UPDATE,
    PERMISSIONS.SERVICE.READ,
    PERMISSIONS.REPORT.READ,
    PERMISSIONS.REPORT.CREATE,
    PERMISSIONS.REPORT.EXPORT,
  ],
  [ROLES.USER]: [
    PERMISSIONS.USER.READ,
    PERMISSIONS.MONITORING.READ,
    PERMISSIONS.INCIDENT.READ,
    PERMISSIONS.SERVICE.READ,
    PERMISSIONS.REPORT.READ,
  ],
  [ROLES.GUEST]: [],
};
