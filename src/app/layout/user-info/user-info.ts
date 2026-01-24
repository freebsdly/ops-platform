import {
  Component,
  ChangeDetectionStrategy,
  input,
  output,
  signal,
  ViewChild,
  ElementRef,
  AfterViewInit,
  OnDestroy,
} from '@angular/core';
import { NzAvatarModule } from 'ng-zorro-antd/avatar';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzMenuModule } from 'ng-zorro-antd/menu';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzDropdownDirective, NzDropdownMenuComponent } from 'ng-zorro-antd/dropdown';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzSpaceModule } from 'ng-zorro-antd/space';

export interface UserInfoData {
  name: string;
  avatar?: string;
  role?: string;
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
  ],
  templateUrl: './user-info.html',
  styleUrl: './user-info.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'app-user-info'
  }
})
export class UserInfo implements AfterViewInit, OnDestroy {
  user = input<UserInfoData>({
    name: 'Admin User',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Admin',
    role: 'Administrator',
  });

  onLogout = output<void>();

  @ViewChild('userInfoArea') userInfoArea!: ElementRef<HTMLDivElement>;

  private resizeObserver: ResizeObserver | null = null;
  dropdownStyle = signal<{ [key: string]: string }>({});

  ngAfterViewInit() {
    this.updateDropdownWidth();

    this.resizeObserver = new ResizeObserver(() => {
      this.updateDropdownWidth();
    });

    this.resizeObserver.observe(this.userInfoArea.nativeElement);
  }

  ngOnDestroy() {
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }
  }

  private updateDropdownWidth() {
    this.dropdownStyle.set({ width: '320px' });
  }

  logout() {
    this.onLogout.emit();
  }
}
