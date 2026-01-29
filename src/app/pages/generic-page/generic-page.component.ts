import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzAlertModule } from 'ng-zorro-antd/alert';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-generic-page',
  standalone: true,
  imports: [
    CommonModule,
    NzCardModule,
    NzButtonModule,
    NzAlertModule,
    NzIconModule,
    TranslateModule
  ],
  templateUrl: './generic-page.html',
  styleUrl: './generic-page.css'
})
export class GenericPageComponent {
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  // 路由参数信号
  private routeParams = signal<any>({});

  // 当前页面标题
  currentTitle = computed(() => {
    const params = this.routeParams();
    const route = this.router.url;

    // 从路由中提取页面名称
    const segments = route.split('/').filter(segment => segment.length > 0);
    const lastSegment = segments[segments.length - 1] || 'welcome';

    // 将路由段转换为可读的标题
    return this.formatRouteTitle(lastSegment);
  });

  // 当前页面描述
  currentDescription = computed(() => {
    const title = this.currentTitle();
    return `这是 ${title} 页面，显示相关功能和数据。`;
  });

  // 页面URL路径
  currentPath = computed(() => {
    return this.router.url;
  });

  // 模块信息
  moduleInfo = computed(() => {
    const route = this.router.url;
    const segments = route.split('/').filter(segment => segment.length > 0);

    if (segments.length === 0) return { name: '欢迎页', icon: 'home' };

    const moduleMap: Record<string, { name: string, icon: string }> = {
      'configuration': { name: '配置中心', icon: 'setting' },
      'monitoring': { name: '监控中心', icon: 'monitor' },
      'incident': { name: '事件中心', icon: 'alert' },
      'service': { name: '服务中心', icon: 'customer-service' }
    };

    return moduleMap[segments[0]] || { name: '未知模块', icon: 'question-circle' };
  });

  constructor() {
    // 监听路由参数变化
    this.route.params.subscribe(params => {
      this.routeParams.set(params);
    });
  }

  // 格式化路由标题
  private formatRouteTitle(routeSegment: string): string {
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
      'object': '监控对象',
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
      'anomaly': '异常检测',
      'capacity': '容量监控',
      'availability': '可用度监控',
      'dashboard': '数据大屏',
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
      'intelligent': '智能处置',
      'desk': '服务台',
      'workorder': '工单管理',
      'approval': '工单审批',
      'catalog': '服务目录',
      'dispatch': '工单派单',
      'sla': '工单SLA',
      'consultation': '在线咨询',
      'execution': '工单执行',
      'archiving': '工单归档',
      'feedback': '客户反馈',
      'sla-monitor': 'SLA监控',
      'slm': '服务级别管理',
      'bulk': '批量工单处理',
      'selfservice': '自助服务',
      'report': '服务报告',
      'cost': '成本分摊',
      'improvement': '服务改进',
      'welcome': '欢迎页'
    };

    return titleMap[routeSegment] || this.toReadableTitle(routeSegment);
  }

  // 将路由段转换为可读标题
  private toReadableTitle(segment: string): string {
    return segment
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  // 返回上一页
  goBack(): void {
    window.history.back();
  }

  // 刷新当前页面
  refreshPage(): void {
    window.location.reload();
  }

  // 模拟操作
  simulateAction(action: string): void {
    console.log(`执行操作: ${action}`);
    // 这里可以添加实际的业务逻辑
  }
}
