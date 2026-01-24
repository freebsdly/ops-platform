import { Component } from '@angular/core';
import { NzAvatarModule } from 'ng-zorro-antd/avatar';

@Component({
  selector: 'app-user-info',
  imports: [NzAvatarModule],
  templateUrl: './user-info.html',
  styleUrl: './user-info.css',
  host: {
    class: 'app-user-info'
  }
})
export class UserInfo {
  userName = 'Admin User';
  userAvatar = 'https://api.dicebear.com/7.x/avataaars/svg?seed=Admin';
}
