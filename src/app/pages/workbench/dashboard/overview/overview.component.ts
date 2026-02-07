import { Component, inject, signal, computed, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzStatisticModule } from 'ng-zorro-antd/statistic';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzAlertModule } from 'ng-zorro-antd/alert';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzProgressModule } from 'ng-zorro-antd/progress';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzEmptyModule } from 'ng-zorro-antd/empty';
import { TranslateModule } from '@ngx-translate/core';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-overview-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    NzCardModule,
    NzGridModule,
    NzStatisticModule,
    NzTableModule,
    NzAlertModule,
    NzIconModule,
    NzButtonModule,
    NzProgressModule,
    NzTagModule,
    NzEmptyModule,
    TranslateModule
  ],
  templateUrl: './overview.html',
  styleUrl: './overview.css'
})
export class OverviewDashboardComponent implements OnDestroy {
  private destroy$ = new Subject<void>();

  // 模拟数据
  systemHealth = signal(87);
  activeServices = signal(124);
  pendingAlerts = signal(8);
  completedTasks = signal(1567);

  // 告警数据
  alertsData = signal([
    {
      id: 1,
      level: '高',
      service: 'Web服务',
      description: '响应时间超过阈值',
      time: '10分钟前',
      status: '待处理',
    },
    {
      id: 2,
      level: '中',
      service: '数据库',
      description: '连接数接近上限',
      time: '30分钟前',
      status: '处理中',
    },
    {
      id: 3,
      level: '低',
      service: '缓存服务',
      description: '内存使用率偏高',
      time: '1小时前',
      status: '已确认',
    },
  ]);

  // 服务状态数据
  servicesData = signal([
    {
      name: 'Web服务集群',
      status: '运行正常',
      uptime: '99.8%',
      responseTime: '125ms',
      instances: 8,
    },
    {
      name: '数据库集群',
      status: '运行正常',
      uptime: '99.9%',
      responseTime: '45ms',
      instances: 3,
    },
    {
      name: '缓存服务',
      status: '运行正常',
      uptime: '99.7%',
      responseTime: '12ms',
      instances: 6,
    },
    {
      name: '消息队列',
      status: '运行正常',
      uptime: '99.6%',
      responseTime: '28ms',
      instances: 4,
    },
  ]);

  // 待办事项
  todoItems = signal([
    { id: 1, task: '数据库备份计划审核', priority: '高', dueDate: '今天' },
    { id: 2, task: '监控告警规则优化', priority: '中', dueDate: '明天' },
    { id: 3, task: '服务可用性报告', priority: '低', dueDate: '本周' },
  ]);

  // 计算统计数据
  totalServices = computed(() => this.servicesData().length);
  healthyServices = computed(() => 
    this.servicesData().filter(s => s.status === '运行正常').length
  );
  
  // 告警级别计数函数
  getAlertLevelCount(level: string): number {
    return this.alertsData().filter(a => a.level === level).length;
  }

  // 系统状态
  systemStatus = computed(() => {
    const health = this.systemHealth();
    if (health >= 90) return { level: 'success', text: '健康' };
    if (health >= 70) return { level: 'warning', text: '正常' };
    return { level: 'error', text: '警告' };
  });

  // 刷新数据
  refreshData(): void {
    console.log('刷新概览仪表盘数据');
    // 这里可以调用API获取最新数据
    // 暂时使用模拟数据更新
    this.systemHealth.set(Math.floor(Math.random() * 20) + 80);
    this.activeServices.set(Math.floor(Math.random() * 50) + 100);
    this.pendingAlerts.set(Math.floor(Math.random() * 5) + 5);
    this.completedTasks.set(this.completedTasks() + 10);
  }

  // 处理告警
  handleAlert(alertId: number): void {
    console.log(`处理告警: ${alertId}`);
    const updatedAlerts = this.alertsData().map(alert => 
      alert.id === alertId ? { ...alert, status: '处理中' } : alert
    );
    this.alertsData.set(updatedAlerts);
  }

  // 完成任务
  completeTodo(todoId: number): void {
    console.log(`完成任务: ${todoId}`);
    const updatedTodos = this.todoItems().filter(todo => todo.id !== todoId);
    this.todoItems.set(updatedTodos);
    this.completedTasks.update(count => count + 1);
  }

  // 查看详细信息
  viewServiceDetails(serviceName: string): void {
    console.log(`查看服务详情: ${serviceName}`);
    // 这里可以导航到服务详情页面
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}