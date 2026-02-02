import { Routes } from '@angular/router';
import { ConfigurationComponent } from './configuration.component';
import { ConfigurationPageComponent } from './components/configuration-page.component';
import { AuthGuard } from '../../guards/auth.guard';

// 配置模块的子路由
export const CONFIGURATION_ROUTES: Routes = [
  {
    path: '',
    component: ConfigurationComponent,
    children: [
      // 配置管理子模块
      { path: 'management/model', component: ConfigurationPageComponent, canActivate: [AuthGuard] },
      { path: 'management/attribute', component: ConfigurationPageComponent, canActivate: [AuthGuard] },
      { path: 'management/relationship', component: ConfigurationPageComponent, canActivate: [AuthGuard] },
      
      // 运营管理子模块
      { path: 'operation/collection', component: ConfigurationPageComponent, canActivate: [AuthGuard] },
      { path: 'operation/audit', component: ConfigurationPageComponent, canActivate: [AuthGuard] },
      { path: 'operation/config-change', component: ConfigurationPageComponent, canActivate: [AuthGuard] },
      
      // 协同赋能子模块
      { path: 'collaboration/topology', component: ConfigurationPageComponent, canActivate: [AuthGuard] },
      { path: 'collaboration/api', component: ConfigurationPageComponent, canActivate: [AuthGuard] },
      { path: 'collaboration/compliance', component: ConfigurationPageComponent, canActivate: [AuthGuard] },
      { path: 'collaboration/analysis', component: ConfigurationPageComponent, canActivate: [AuthGuard] },
      
      // 默认重定向到模型管理
      { path: '', redirectTo: 'management/model', pathMatch: 'full' }
    ]
  }
];