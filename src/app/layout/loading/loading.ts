import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouteLoadingService } from '../../services/route-loading.service';

@Component({
  selector: 'app-loading',
  imports: [],
  templateUrl: './loading.html',
  styleUrl: './loading.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Loading {
  readonly loadingService = inject(RouteLoadingService);
}
