import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Router, NavigationEnd } from '@angular/router';
import { tap, filter, map } from 'rxjs/operators';
import * as LayoutActions from './layout.actions';
import { MODULES_CONFIG } from '../../../config/menu.config';
import { StorageService, StorageType } from '../../services/storage.service';

@Injectable()
export class LayoutEffects {
  private actions$ = inject(Actions);
  private router = inject(Router);
  private storageService = inject(StorageService);

  persistLayoutState$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(
          LayoutActions.toggleSider,
          LayoutActions.collapseSider,
          LayoutActions.expandSider,
          LayoutActions.setSiderCollapsed,
          LayoutActions.setTheme
        ),
        tap((action) => {
          // Persist layout state to storage for persistence
          if (action.type === LayoutActions.setTheme.type) {
            this.storageService.setItem('theme', (action as any).theme, {
              type: StorageType.LOCAL
            });
          } else if (action.type === LayoutActions.setSiderCollapsed.type) {
            this.storageService.setItem('siderCollapsed', (action as any).collapsed.toString(), {
              type: StorageType.LOCAL
            });
          }
        })
      ),
    { dispatch: false }
  );

  // Automatically detect and set current module based on route changes
  detectCurrentModule$ = createEffect(
    () =>
      this.router.events.pipe(
        filter(event => event instanceof NavigationEnd),
        map(event => {
          const url = (event as NavigationEnd).url;
          const segments = url.split('/').filter(segment => segment.length > 0);
          
          // Default to dashboard if no segments
          let currentModule = segments[0] || 'dashboard';
          
          // Check if it's a valid module from MODULES_CONFIG
          const validModuleIds = MODULES_CONFIG.map(module => module.id);
          if (!validModuleIds.includes(currentModule)) {
            currentModule = 'dashboard';
          }
          
          console.log(`[LayoutEffects] Navigation to ${url}, detected module: ${currentModule}`);
          return LayoutActions.setCurrentModule({ module: currentModule });
        })
      )
  );
}