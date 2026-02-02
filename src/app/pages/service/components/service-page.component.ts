import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-service-page',
  template: `
    <div class="service-page">
      <h2>{{ pageTitle }}</h2>
      <p>这是服务中心模块的功能页面。</p>
      <p>当前路由: {{ currentPath }}</p>
    </div>
  `,
  styles: [`
    .service-page {
      padding: 20px;
    }
  `],
  imports: [CommonModule]
})
export class ServicePageComponent {
  protected readonly route = inject(ActivatedRoute);
  
  protected currentPath = '';
  protected pageTitle = '';

  constructor() {
    this.currentPath = this.route.snapshot.routeConfig?.path || '';
    this.pageTitle = this.getPageTitleFromPath(this.currentPath);
  }

  private getPageTitleFromPath(path: string): string {
    const pathParts = path.split('/');
    const lastPart = pathParts[pathParts.length - 1];
    
    const titleMap: Record<string, string> = {
      'desk': '服务台',
      'workorder': '工单管理',
      'approval': '工单审批',
      'catalog': '服务目录',
      'dispatch': '工单派单',
      'sla': '工单SLA',
      'consultation': '在线咨询',
      'execution': '工单执行',
      'archiving': '工单归档',
      'knowledge': '知识库',
      'feedback': '客户反馈',
      'sla-monitor': 'SLA监控',
      'slm': '服务级别管理',
      'bulk': '批量工单处理',
      'selfservice': '自助服务',
      'report': '服务报告',
      'statistics': '工单统计',
      'service-report': '服务报告详情',
      'cost': '成本分摊',
      'analysis': '数据分析',
      'improvement': '服务改进'
    };
    
    return titleMap[lastPart] || '服务中心';
  }
}