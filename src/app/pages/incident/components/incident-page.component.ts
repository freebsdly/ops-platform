import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-incident-page',
  template: `
    <div class="incident-page">
      <h2>{{ pageTitle }}</h2>
      <p>这是事件中心模块的功能页面。</p>
      <p>当前路由: {{ currentPath }}</p>
    </div>
  `,
  styles: [`
    .incident-page {
      padding: 20px;
    }
  `],
  imports: [CommonModule]
})
export class IncidentPageComponent {
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
      'aggregation': '事件聚合',
      'event-grading': '事件定级',
      'ledger': '事件台账',
      'oncall': 'OnCall排班',
      'classification': '事件分类',
      'handover': '值班交接',
      'silence': '事件静默',
      'response': '事件响应',
      'handling': '事件处置',
      'recovery': '事件恢复',
      'problem': '问题管理',
      'rca': '根因分析',
      'change-association': '变更关联',
      'plan': '应急预案',
      'collaboration': '跨团队协作',
      'review': '事件复盘',
      'statistics': '事件统计',
      'knowledge': '经验库',
      'standard': '标准化复盘',
      'drill': '故障演练',
      'analysis': '数据分析',
      'intelligent': '智能处置'
    };
    
    return titleMap[lastPart] || '事件中心';
  }
}