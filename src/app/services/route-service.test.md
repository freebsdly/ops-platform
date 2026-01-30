// 路由配置和路由加载服务测试说明
// 文件：src/app/services/route-service.test.md

## 新增的服务功能

### 1. RouteConfigService (路由配置服务)
- **功能**: 集中管理所有路由配置，提供路由信息查询和转换
- **主要方法**:
  - `getRouteConfig(path: string)`: 根据路径获取路由配置
  - `getTabConfig(path: string)`: 获取Tab页配置
  - `getAllRouteConfigs()`: 获取所有路由配置
  - `getMenuStructure()`: 获取菜单结构
  - `getRoutesByModule()`: 按模块分组路由
  - `getRoutesForModule(moduleId: string)`: 获取特定模块的路由

### 2. RouteLoadingService (路由加载服务)
- **功能**: 管理路由加载状态，提供loading状态信号
- **主要方法**:
  - `loading()`: 获取当前加载状态（信号）
  - `setLoading(state: boolean)`: 手动设置加载状态
  - `startManualLoading()` / `endManualLoading()`: 手动开始/结束加载
  - `withLoading<T>(operation)`: 包装异步操作自动管理loading状态
  - `isLoadingNow()`: 检查当前是否正在加载

## 使用示例

### 组件中使用路由配置服务
```typescript
import { Component, inject } from '@angular/core';
import { RouteConfigService } from './services/route-config.service';
import { RouteLoadingService } from './services/route-loading.service';

@Component({
  selector: 'app-example',
  template: `
    <div *ngIf="loading()">Loading...</div>
    <div *ngFor="let route of routes">
      {{ route.titleKey }} - {{ route.path }}
    </div>
  `
})
export class ExampleComponent {
  private routeConfig = inject(RouteConfigService);
  private routeLoading = inject(RouteLoadingService);
  
  routes = this.routeConfig.getAllRouteConfigs();
  loading = this.routeLoading.loading;
  
  async loadData() {
    return this.routeLoading.withLoading(async () => {
      // 异步操作
      await this.someApiCall();
    });
  }
}
```

### Tab组件示例
```typescript
getTabInfo(path: string) {
  const tabConfig = this.routeConfig.getTabConfig(path);
  return {
    key: tabConfig.key,
    label: this.translate.instant(tabConfig.label),
    icon: tabConfig.icon
  };
}
```

## 与现有架构的集成

1. **路由配置来源**: 基于现有的 `menu.config.ts` 动态生成
2. **懒加载兼容**: 不影响现有的懒加载机制
3. **状态管理**: 与NgRx Store协同工作
4. **国际化**: 使用翻译键而不是硬编码文本

## 优势

1. **集中管理**: 所有路由配置在一个地方管理
2. **类型安全**: TypeScript接口确保类型安全
3. **可扩展**: 支持动态路由和模块化组织
4. **状态追踪**: 实时路由加载状态追踪
5. **UI集成**: 与Tab管理、菜单生成等UI组件无缝集成

## 验证测试

服务已通过以下验证：
1. ✅ TypeScript编译通过
2. ✅ Angular应用构建成功  
3. ✅ 与现有菜单配置集成正常
4. ✅ 服务注入正常工作

## 后续扩展建议

1. **路由权限控制**: 在RouteConfig中添加权限字段
2. **路由缓存**: 添加路由数据缓存机制
3. **路由分析**: 添加路由访问统计和分析功能
4. **自定义布局**: 支持不同路由使用不同布局