import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-configuration-page',
  template: `
    <div class="configuration-page">
      <h2>{{ pageTitle }}</h2>
      <p>这是配置管理模块的功能页面。</p>
      <p>当前路由: {{ currentPath }}</p>
    </div>
  `,
  styles: [`
    .configuration-page {
      padding: 20px;
    }
  `],
  imports: [CommonModule]
})
export class ConfigurationPageComponent {
  protected readonly route = inject(ActivatedRoute);
  
  protected currentPath = '';
  protected pageTitle = '';

  constructor() {
    this.currentPath = this.route.snapshot.routeConfig?.path || '';
    this.pageTitle = this.getPageTitleFromPath(this.currentPath);
  }

  private getPageTitleFromPath(path: string): string {
    // 根据路径生成页面标题
    const pathParts = path.split('/');
    const lastPart = pathParts[pathParts.length - 1];
    
    // 简单的路径到标题的映射
    const titleMap: Record<string, string> = {
      'model': '模型管理',
      'attribute': '属性管理',
      'relationship': '关联关系',
      'collection': '配置采集',
      'audit': '配置审计',
      'config-change': '配置变更',
      'topology': '拓扑可视化',
      'api': 'API管理',
      'compliance': '合规检查',
      'analysis': '数据分析'
    };
    
    return titleMap[lastPart] || '配置管理';
  }
}