import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCheckboxModule } from 'ng-zorro-antd/checkbox';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzAlertModule } from 'ng-zorro-antd/alert';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { LangSelector } from '../../layout/lang-selector/lang-selector';
import { StoreService } from '../../core/stores/store.service';
import { AsyncPipe } from '@angular/common';
import { combineLatest, take } from 'rxjs';

@Component({
  selector: 'app-login',
  imports: [
    ReactiveFormsModule,
    NzFormModule,
    NzInputModule,
    NzButtonModule,
    NzCheckboxModule,
    NzCardModule,
    NzIconModule,
    NzGridModule,
    NzAlertModule,
    TranslateModule,
    LangSelector,
    AsyncPipe,
  ],
  template: `
    <div
      class="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8"
    >
      <div class="w-full max-w-md">
        <nz-card class="shadow-xl rounded-2xl overflow-hidden relative">
          <div class="text-center mb-8">
            <div
              class="mx-auto w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mb-4"
            >
              <span nz-icon nzType="lock" nzTheme="outline" class="text-white text-2xl"></span>
            </div>
            <h2 class="text-3xl font-bold text-gray-900">
              {{ 'LOGIN.TITLE' | translate }}
            </h2>
            <p class="mt-2 text-sm text-gray-600">
              {{ 'APP.DESCRIPTION' | translate }}
            </p>
          </div>

          <!-- Language switcher in top right corner -->
          <div class="absolute top-4 right-4">
            <app-lang-selector />
          </div>

          <form [formGroup]="loginForm" (ngSubmit)="onSubmit()" nz-form nzLayout="vertical">
            <nz-form-item>
              <nz-form-control [nzErrorTip]="'LOGIN.VALIDATION.EMAIL_REQUIRED' | translate">
                <nz-input-group nzPrefixIcon="user" nzSize="large">
                  <input
                    nz-input
                    [placeholder]="'LOGIN.EMAIL_PLACEHOLDER' | translate"
                    formControlName="email"
                    type="email"
                    autocomplete="email"
                  />
                </nz-input-group>
              </nz-form-control>
            </nz-form-item>

            <nz-form-item>
              <nz-form-control [nzErrorTip]="'LOGIN.VALIDATION.PASSWORD_REQUIRED' | translate">
                <nz-input-group nzPrefixIcon="lock" nzSize="large">
                  <input
                    nz-input
                    [placeholder]="'LOGIN.PASSWORD_PLACEHOLDER' | translate"
                    formControlName="password"
                    type="password"
                    autocomplete="current-password"
                  />
                </nz-input-group>
              </nz-form-control>
            </nz-form-item>

            <div class="flex items-center justify-between mb-6">
              <label nz-checkbox formControlName="rememberMe">
                <span>{{ 'LOGIN.REMEMBER_ME' | translate }}</span>
              </label>
              <a class="text-sm text-blue-600 hover:text-blue-500" href="#">
                {{ 'LOGIN.FORGOT_PASSWORD' | translate }}
              </a>
            </div>

            <button
              nz-button
              nzType="primary"
              nzBlock
              nzSize="large"
              [nzLoading]="isLoading$ | async"
              [disabled]="loginForm.invalid || (isLoading$ | async)"
              type="submit"
              class="mb-4"
            >
              {{ 'LOGIN.LOGIN_BUTTON' | translate }}
            </button>

            <div class="text-center">
              <span class="text-sm text-gray-600">
                {{ 'LOGIN.REGISTER_LINK' | translate }}
              </span>
            </div>
          </form>
        </nz-card>

        @if (authError$ | async; as error) {
        <nz-alert nzType="error" [nzMessage]="error" class="mt-4" nzShowIcon></nz-alert>
        }
      </div>
    </div>
  `,
})
export class LoginComponent implements OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private message = inject(NzMessageService);
  private translate = inject(TranslateService);
  private storeService = inject(StoreService);
  
  loginForm!: FormGroup;
  
  // NgRx state observables
  isLoading$ = this.storeService.isLoading$;
  authError$ = this.storeService.authError$;

  ngOnInit(): void {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      rememberMe: [false],
    });

    // Clear any previous auth errors
    this.storeService.clearAuthError();
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      return;
    }

    const { email, password } = this.loginForm.value;
    
    // Dispatch login action
    this.storeService.login(email, password);

    // Subscribe to login success/failure
    combineLatest([
      this.storeService.isAuthenticated$,
      this.storeService.authError$
    ]).pipe(take(1)).subscribe(([isAuthenticated, error]) => {
      if (isAuthenticated) {
        this.message.success(this.translate.instant('LOGIN.SUCCESS'));
        const returnUrl = this.router.routerState.snapshot.root.queryParams['returnUrl'] || '/';
        this.router.navigateByUrl(returnUrl);
      } else if (error) {
        this.message.error(error);
      }
    });
  }
}