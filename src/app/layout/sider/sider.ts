import { Component, input } from '@angular/core';

@Component({
  selector: 'app-sider',
  templateUrl: './sider.html',
  styleUrl: './sider.css',
})
export class Sider {
  // 从父组件接收侧边栏状态
  isSiderCollapsed = input<boolean>(false);
}
