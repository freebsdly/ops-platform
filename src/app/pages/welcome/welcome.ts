import { Component } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzButtonModule } from 'ng-zorro-antd/button';

@Component({
  selector: 'app-welcome',
  imports: [TranslateModule, NzCardModule, NzButtonModule],
  templateUrl: './welcome.html',
  styleUrl: './welcome.css'
})
export class Welcome {}
