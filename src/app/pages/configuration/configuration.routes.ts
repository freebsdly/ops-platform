import { Routes } from '@angular/router';
import { ConfigurationComponent } from './configuration.component';
import { ConfigurationPageComponent } from './components/configuration-page.component';

// 配置模块的子路由
export const CONFIGURATION_ROUTES: Routes = [
  {
    path: '',
    component: ConfigurationComponent,
    children: [
      // 配置管理子模块
      { path: 'management/model', component: ConfigurationPageComponent },
      { path: 'management/attribute', component: ConfigurationPageComponent },
      { path: 'management/relationship', component: ConfigurationPageComponent },
      
      // 运营管理子模块
      { path: 'operation/collection', component: ConfigurationPageComponent },
      { path: 'operation/audit', component: ConfigurationPageComponent },
      { path: 'operation/config-change', component: ConfigurationPageComponent },
      
      // 协同赋能子模块
      { path: 'collaboration/topology', component: ConfigurationPageComponent },
      { path: 'collaboration/api', component: ConfigurationPageComponent },
      { path: 'collaboration/compliance', component: ConfigurationPageComponent },
      { path: 'collaboration/analysis', component: ConfigurationPageComponent },
      
      // 默认重定向到模型管理
      { path: '', redirectTo: 'management/model', pathMatch: 'full' }
    ]
  }
];