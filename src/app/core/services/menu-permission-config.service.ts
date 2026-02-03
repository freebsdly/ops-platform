import { Injectable, inject } from '@angular/core';
import { MenuItem } from '../../config/menu.config';

@Injectable({
  providedIn: 'root'
})
export class MenuPermissionConfigService {
  
  // 权限定义
  private readonly permissionDefinitions = {
    // 配置管理模块权限
    configuration: {
      read: { resource: 'configuration', action: 'read' },
      manage: { resource: 'configuration', action: 'manage' },
      audit: { resource: 'configuration', action: 'audit' }
    },
    // 监控中心模块权限
    monitoring: {
      read: { resource: 'monitoring', action: 'read' },
      manage: { resource: 'monitoring', action: 'manage' },
      analyze: { resource: 'monitoring', action: 'analyze' }
    },
    // 事件中心模块权限
    incident: {
      read: { resource: 'incident', action: 'read' },
      manage: { resource: 'incident', action: 'manage' },
      resolve: { resource: 'incident', action: 'resolve' },
      analyze: { resource: 'incident', action: 'analyze' }  // 添加analyze属性
    },
    // 服务中心模块权限
    service: {
      read: { resource: 'service', action: 'read' },
      manage: { resource: 'service', action: 'manage' },
      process: { resource: 'service', action: 'process' },
      analyze: { resource: 'service', action: 'analyze' }  // 添加analyze属性
    }
  };

  // 角色定义
  private readonly roleDefinitions = {
    admin: ['admin'],
    config_manager: ['admin', 'config_manager'],
    monitor_operator: ['admin', 'monitor_operator'],
    incident_responder: ['admin', 'incident_responder'],
    service_manager: ['admin', 'service_manager']
  };

  /**
   * 为菜单项添加权限配置
   */
  addPermissionsToMenuItem(menuItem: MenuItem): MenuItem {
    if (menuItem.link) {
      // 根据链接路径添加权限
      const permission = this.getPermissionByLink(menuItem.link);
      if (permission) {
        return {
          ...menuItem,
          permission: permission.permission,
          roles: permission.roles
        };
      }
    }

    // 递归处理子菜单
    if (menuItem.children && menuItem.children.length > 0) {
      return {
        ...menuItem,
        children: menuItem.children.map((child: MenuItem) => this.addPermissionsToMenuItem(child))
      };
    }

    return menuItem;
  }

  /**
   * 根据链接获取权限配置
   */
  private getPermissionByLink(link: string): { permission: any; roles?: string[] } | null {
    // 解析链接路径
    const pathParts = link.split('/').filter(part => part.length > 0);
    
    if (pathParts.length < 2) return null;

    const moduleId = pathParts[0];
    const subModule = pathParts[1];
    const functionName = pathParts[2];

    // 根据路径模式分配权限
    switch (moduleId) {
      case 'configuration':
        return this.getConfigurationPermission(subModule, functionName);
      case 'monitoring':
        return this.getMonitoringPermission(subModule, functionName);
      case 'incident':
        return this.getIncidentPermission(subModule, functionName);
      case 'service':
        return this.getServicePermission(subModule, functionName);
      default:
        return null;
    }
  }

  /**
   * 配置管理模块权限
   */
  private getConfigurationPermission(subModule: string, functionName?: string): { permission: any; roles?: string[] } {
    switch (subModule) {
      case 'management':
        return {
          permission: this.permissionDefinitions.configuration.read,
          roles: this.roleDefinitions.config_manager
        };
      case 'operation':
        if (functionName === 'audit') {
          return {
            permission: this.permissionDefinitions.configuration.audit,
            roles: this.roleDefinitions.config_manager
          };
        }
        return {
          permission: this.permissionDefinitions.configuration.manage,
          roles: this.roleDefinitions.config_manager
        };
      case 'collaboration':
        if (functionName === 'compliance') {
          return {
            permission: this.permissionDefinitions.configuration.audit,
            roles: this.roleDefinitions.config_manager
          };
        }
        if (functionName === 'api') {
          return {
            permission: this.permissionDefinitions.configuration.manage,
            roles: this.roleDefinitions.config_manager
          };
        }
        return {
          permission: this.permissionDefinitions.configuration.read,
          roles: this.roleDefinitions.config_manager
        };
      default:
        return {
          permission: this.permissionDefinitions.configuration.read,
          roles: this.roleDefinitions.config_manager
        };
    }
  }

  /**
   * 监控中心模块权限
   */
  private getMonitoringPermission(subModule: string, functionName?: string): { permission: any; roles?: string[] } {
    switch (subModule) {
      case 'management':
        return {
          permission: this.permissionDefinitions.monitoring.manage,
          roles: this.roleDefinitions.monitor_operator
        };
      case 'operation':
        if (functionName === 'visualization') {
          return {
            permission: this.permissionDefinitions.monitoring.analyze,
            roles: this.roleDefinitions.monitor_operator
          };
        }
        return {
          permission: this.permissionDefinitions.monitoring.read,
          roles: this.roleDefinitions.monitor_operator
        };
      case 'collaboration':
        return {
          permission: this.permissionDefinitions.monitoring.analyze,
          roles: this.roleDefinitions.monitor_operator
        };
      default:
        return {
          permission: this.permissionDefinitions.monitoring.read,
          roles: this.roleDefinitions.monitor_operator
        };
    }
  }

  /**
   * 事件中心模块权限
   */
  private getIncidentPermission(subModule: string, functionName?: string): { permission: any; roles?: string[] } {
    switch (subModule) {
      case 'management':
        return {
          permission: this.permissionDefinitions.incident.manage,
          roles: this.roleDefinitions.incident_responder
        };
      case 'operation':
        if (functionName === 'recovery' || functionName === 'rca') {
          return {
            permission: this.permissionDefinitions.incident.resolve,
            roles: this.roleDefinitions.incident_responder
          };
        }
        return {
          permission: this.permissionDefinitions.incident.read,
          roles: this.roleDefinitions.incident_responder
        };
      case 'collaboration':
        return {
          permission: this.permissionDefinitions.incident.analyze,
          roles: this.roleDefinitions.incident_responder
        };
      default:
        return {
          permission: this.permissionDefinitions.incident.read,
          roles: this.roleDefinitions.incident_responder
        };
    }
  }

  /**
   * 服务中心模块权限
   */
  private getServicePermission(subModule: string, functionName?: string): { permission: any; roles?: string[] } {
    switch (subModule) {
      case 'management':
        if (functionName === 'sla') {
          return {
            permission: this.permissionDefinitions.service.manage,
            roles: this.roleDefinitions.service_manager
          };
        }
        return {
          permission: this.permissionDefinitions.service.process,
          roles: this.roleDefinitions.service_manager
        };
      case 'operation':
        if (functionName === 'execution' || functionName === 'archiving') {
          return {
            permission: this.permissionDefinitions.service.process,
            roles: this.roleDefinitions.service_manager
          };
        }
        return {
          permission: this.permissionDefinitions.service.read,
          roles: this.roleDefinitions.service_manager
        };
      case 'collaboration':
        return {
          permission: this.permissionDefinitions.service.analyze,
          roles: this.roleDefinitions.service_manager
        };
      default:
        return {
          permission: this.permissionDefinitions.service.read,
          roles: this.roleDefinitions.service_manager
        };
    }
  }

  /**
   * 获取所有菜单项的权限配置
   */
  getPermissionConfigs(): Map<string, { permission: any; roles?: string[] }> {
    const configMap = new Map<string, { permission: any; roles?: string[] }>();

    // 这里可以添加具体的权限配置映射
    // 例如：
    configMap.set('/configuration/management/model', {
      permission: { resource: 'configuration', action: 'read' },
      roles: ['admin', 'config_manager']
    });

    configMap.set('/configuration/management/attribute', {
      permission: { resource: 'configuration', action: 'read' },
      roles: ['admin', 'config_manager']
    });

    configMap.set('/configuration/operation/collection', {
      permission: { resource: 'configuration', action: 'manage' },
      roles: ['admin', 'config_manager']
    });

    configMap.set('/configuration/operation/audit', {
      permission: { resource: 'configuration', action: 'audit' },
      roles: ['admin', 'config_manager']
    });

    // 添加更多配置...

    return configMap;
  }
}