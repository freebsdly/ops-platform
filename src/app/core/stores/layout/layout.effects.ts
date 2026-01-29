import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Router, NavigationEnd } from '@angular/router';
import { tap, filter, map } from 'rxjs/operators';
import * as LayoutActions from './layout.actions';

@Injectable()
export class LayoutEffects {
  private actions$ = inject(Actions);
  private router = inject(Router);

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
          // Persist layout state to localStorage for persistence
          if (action.type === LayoutActions.setTheme.type) {
            localStorage.setItem('theme', (action as any).theme);
          } else if (action.type === LayoutActions.setSiderCollapsed.type) {
            localStorage.setItem('siderCollapsed', (action as any).collapsed.toString());
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
          
          // Default to dashboard if no segments or first segment is dashboard
          let currentModule = segments[0] || 'dashboard';
          
          // Check if it's a valid module from MODULES_CONFIG
          const validModules = ['dashboard', 'configuration', 'monitoring', 'incident', 'service'];
          if (!validModules.includes(currentModule)) {
            currentModule = 'dashboard';
          }
          
          return LayoutActions.setCurrentModule({ module: currentModule });
        })
      )
  );
}