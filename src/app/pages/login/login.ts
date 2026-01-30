import { Component, OnInit, inject, signal } from '@angular/core';
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
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class LoginComponent implements OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private message = inject(NzMessageService);
  private translate = inject(TranslateService);
  private storeService = inject(StoreService);

  readonly passwordVisible = signal(false);

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
    combineLatest([this.storeService.isAuthenticated$, this.storeService.authError$])
      .pipe(take(1))
      .subscribe(([isAuthenticated, error]) => {
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
