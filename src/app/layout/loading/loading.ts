import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouteLoadingService } from '../../services/route-loading.service';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-loading',
  imports: [TranslateModule],
  templateUrl: './loading.html',
  styleUrl: './loading.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Loading {
  readonly loadingService = inject(RouteLoadingService);
}
