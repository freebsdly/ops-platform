import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { tap } from 'rxjs/operators';
import * as LayoutActions from './layout.actions';

@Injectable()
export class LayoutEffects {
  private actions$ = inject(Actions);

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
}