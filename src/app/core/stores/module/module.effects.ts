import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { catchError, map, mergeMap } from 'rxjs/operators';
import * as ModuleActions from './module.actions';
import { ModuleMenuService } from '../../../services/module-menu.service';

@Injectable()
export class ModuleEffects {
  private actions$ = inject(Actions);
  private moduleMenuService = inject(ModuleMenuService);

  loadModules$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ModuleActions.loadModules),
      mergeMap(() =>
        this.moduleMenuService.getModules().pipe(
          map((modules: string[]) => ModuleActions.loadModulesSuccess({ modules })),
          catchError((error) =>
            of(ModuleActions.loadModulesFailure({ error: error.message }))
          )
        )
      )
    )
  );
}