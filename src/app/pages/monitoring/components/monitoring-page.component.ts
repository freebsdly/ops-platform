import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-monitoring-page',
  template: `
    <div class="monitoring-page">
      <h2>{{ pageTitle }}</h2>
      <p>这是监控中心模块的功能页面。</p>
      <p>当前路由: {{ currentPath }}</p>
    </div>
  `,
  styles: [`
    .monitoring-page {
      padding: 20px;
    }
  `],
  imports: [CommonModule]
})
export class MonitoringPageComponent {
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
      'object': '监控对象',
      'collection': '多维度采集',
      'collector': '采集器管理',
      'storage': '指标存储',
      'log': '日志采集',
      'link': '链路监控',
      'cloud': '云原生监控',
      'visualization': '可视化',
      'rules': '告警规则',
      'convergence': '告警收敛',
      'distribution': '告警分发',
      'alert-grading': '告警分级',
      'masking': '告警屏蔽',
      'log-search': '日志检索分析',
      'tracing': '链路溯源',
      'query': '指标查询',
      'analysis': '监控分析',
      'anomaly': '异常检测',
      'capacity': '容量监控',
      'availability': '可用度监控',
      'dashboard': '数据大屏'
    };
    
    return titleMap[lastPart] || '监控中心';
  }
}