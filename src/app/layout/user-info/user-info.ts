import {
  Component,
  ChangeDetectionStrategy,
  output,
  signal,
  ViewChild,
  ElementRef,
  AfterViewInit,
  OnDestroy,
  inject,
  OnInit,
  effect,
} from '@angular/core';
import { NzAvatarModule } from 'ng-zorro-antd/avatar';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzMenuModule } from 'ng-zorro-antd/menu';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzDropdownDirective, NzDropdownMenuComponent } from 'ng-zorro-antd/dropdown';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzSpaceModule } from 'ng-zorro-antd/space';
import { TranslateModule } from '@ngx-translate/core';
import { UserApiService } from '../../core/services/user-api.service';
import { catchError, of, tap, takeUntil } from 'rxjs';
import { Subject } from 'rxjs';

export interface UserInfoData {
  name: string;
  avatar?: string;
  role?: string;
  email?: string;
}

@Component({
  selector: 'app-user-info',
  imports: [
    NzAvatarModule,
    NzButtonModule,
    NzMenuModule,
    NzIconModule,
    NzDropdownDirective,
    NzDropdownMenuComponent,
    NzCardModule,
    NzSpaceModule,
    TranslateModule,
  ],
  templateUrl: './user-info.html',
  styleUrl: './user-info.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'app-user-info',
  },
})
export class UserInfo implements OnInit, AfterViewInit, OnDestroy {
  onLogout = output<void>();

  @ViewChild('userInfoArea') userInfoArea!: ElementRef<HTMLDivElement>;

  private resizeObserver: ResizeObserver | null = null;
  dropdownStyle = signal<{ [key: string]: string }>({});
  private destroy$ = new Subject<void>();

  private userApiService = inject(UserApiService);

  // 从API获取的用户数据
  apiUserData = signal<UserInfoData | null>(null);
  isLoading = signal(true);
  error = signal<string | null>(null);

  constructor() {
    // 监听用户数据变化，当用户数据加载完成后设置 ResizeObserver
    effect(() => {
      const userData = this.apiUserData();
      if (userData && this.userInfoArea?.nativeElement) {
        // 用户数据已加载且元素已渲染，设置观察者
        if (!this.resizeObserver) {
          this.resizeObserver = new ResizeObserver(() => {
            this.updateDropdownWidth();
          });
          this.resizeObserver.observe(this.userInfoArea.nativeElement);
        }
      }
    });
  }

  ngOnInit() {
    this.loadUserFromApi();
  }

  ngAfterViewInit() {
    // 初始化下拉宽度
    this.updateDropdownWidth();
  }

  ngOnDestroy() {
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadUserFromApi() {
    console.log('UserInfo: 从API加载用户数据');
    this.isLoading.set(true);
    this.error.set(null);

    this.userApiService
      .getCurrentUser()
      .pipe(
        tap((user) => {
          console.log('UserInfo: 用户数据加载成功:', user.name);
          this.apiUserData.set({
            name: user.name,
            email: user.email,
            avatar:
              user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`,
            role: user.roles?.includes('admin') ? 'Administrator' : 'User',
          });
          this.isLoading.set(false);
        }),
        catchError((err) => {
          console.error('UserInfo: 加载用户数据失败:', err);
          this.error.set('无法加载用户信息');
          this.isLoading.set(false);
          // 返回默认用户数据
          this.apiUserData.set({
            name: 'Guest User',
            avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=guest',
            role: 'Guest',
          });
          return of(null);
        }),
        takeUntil(this.destroy$)
      )
      .subscribe();
  }

  private updateDropdownWidth() {
    this.dropdownStyle.set({ width: '320px' });
  }

  logout() {
    // 只emit logout事件，让store处理完整的logout流程
    console.log('UserInfo: 触发logout事件');
    this.onLogout.emit();
  }

  // 获取当前显示的用户数据
  get currentUser(): UserInfoData {
    return this.apiUserData()!;
  }
}
