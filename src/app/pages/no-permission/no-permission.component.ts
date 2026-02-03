import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-no-permission',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="no-permission-container">
      <div class="no-permission-content">
        <div class="icon-container">
          <span class="icon">🔒</span>
        </div>
        
        <h1 class="title">权限不足</h1>
        
        <p class="message">
          抱歉，您没有权限访问此页面。请联系系统管理员获取相应权限。
        </p>
        
        <div class="details" *ngIf="returnUrl">
          <p><strong>请求的页面：</strong> {{ returnUrl }}</p>
        </div>
        
        <div class="actions">
          <button class="btn btn-primary" (click)="goToHome()">
            返回首页
          </button>
          <button class="btn btn-secondary" (click)="goBack()" *ngIf="hasHistory">
            返回上一页
          </button>
          <button class="btn btn-link" (click)="contactAdmin()">
            联系管理员
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .no-permission-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 80vh;
      padding: 20px;
    }

    .no-permission-content {
      text-align: center;
      max-width: 500px;
      padding: 40px;
      background: white;
      border-radius: 8px;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    }

    .icon-container {
      margin-bottom: 24px;
    }

    .icon {
      font-size: 64px;
      display: inline-block;
    }

    .title {
      font-size: 28px;
      font-weight: 600;
      color: #333;
      margin-bottom: 16px;
    }

    .message {
      font-size: 16px;
      color: #666;
      line-height: 1.6;
      margin-bottom: 24px;
    }

    .details {
      background: #f5f5f5;
      padding: 16px;
      border-radius: 4px;
      margin-bottom: 24px;
      text-align: left;
    }

    .details p {
      margin: 0;
      font-size: 14px;
      color: #888;
    }

    .actions {
      display: flex;
      gap: 12px;
      justify-content: center;
      flex-wrap: wrap;
    }

    .btn {
      padding: 10px 20px;
      border: none;
      border-radius: 4px;
      font-size: 14px;
      cursor: pointer;
      transition: all 0.3s ease;
      text-decoration: none;
    }

    .btn-primary {
      background-color: #1890ff;
      color: white;
    }

    .btn-primary:hover {
      background-color: #40a9ff;
    }

    .btn-secondary {
      background-color: #f5f5f5;
      color: #333;
      border: 1px solid #d9d9d9;
    }

    .btn-secondary:hover {
      background-color: #e8e8e8;
    }

    .btn-link {
      background: transparent;
      color: #1890ff;
      border: 1px solid transparent;
    }

    .btn-link:hover {
      color: #40a9ff;
      text-decoration: underline;
    }
  `]
})
export class NoPermissionComponent {
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  returnUrl: string | null = null;
  hasHistory = false;

  constructor() {
    // 获取返回URL
    this.route.queryParamMap.subscribe(params => {
      this.returnUrl = params.get('returnUrl');
    });

    // 检查是否有历史记录
    this.hasHistory = window.history.length > 1;
  }

  goToHome(): void {
    this.router.navigate(['/']);
  }

  goBack(): void {
    window.history.back();
  }

  contactAdmin(): void {
    // 这里可以链接到管理员联系页面或触发邮件
    alert('请联系系统管理员：admin@example.com');
  }
}