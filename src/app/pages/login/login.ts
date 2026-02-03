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

// Icons
import {
  LockOutline,
  UserOutline,
  EyeOutline,
  EyeInvisibleOutline,
  CloudServerOutline,
  GithubOutline,
  GoogleOutline,
} from '@ant-design/icons-angular/icons';
import { NZ_ICONS } from 'ng-zorro-antd/icon';
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
  providers: [
    {
      provide: NZ_ICONS,
      useValue: [
        LockOutline,
        UserOutline,
        EyeOutline,
        EyeInvisibleOutline,
        CloudServerOutline,
        GithubOutline,
        GoogleOutline,
      ],
    },
  ],
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
    // 标记所有字段为已触摸以显示验证错误
    Object.keys(this.loginForm.controls).forEach((key) => {
      const control = this.loginForm.get(key);
      control?.markAsTouched();
    });

    if (this.loginForm.invalid) {
      // 显示表单验证错误提示
      this.message.warning(this.translate.instant('LOGIN.VALIDATION.FORM_INVALID'));
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
          // 错误提示已经在模板中显示，这里只记录
          console.error('登录失败:', error);
        }
      });
  }

  // 添加表单字段验证状态跟踪
  get emailInvalid(): boolean {
    const control = this.loginForm.get('email');
    return control ? control.invalid && (control.dirty || control.touched) : false;
  }

  get passwordInvalid(): boolean {
    const control = this.loginForm.get('password');
    return control ? control.invalid && (control.dirty || control.touched) : false;
  }

  // 获取具体的错误消息
  getEmailErrorMessage(): string {
    const control = this.loginForm.get('email');
    if (!control || !control.errors) return '';

    if (control.errors['required']) {
      return this.translate.instant('LOGIN.VALIDATION.EMAIL_REQUIRED');
    }
    if (control.errors['email']) {
      return this.translate.instant('LOGIN.VALIDATION.EMAIL_INVALID');
    }
    return '';
  }

  getPasswordErrorMessage(): string {
    const control = this.loginForm.get('password');
    if (!control || !control.errors) return '';

    if (control.errors['required']) {
      return this.translate.instant('LOGIN.VALIDATION.PASSWORD_REQUIRED');
    }
    if (control.errors['minlength']) {
      return this.translate.instant('LOGIN.VALIDATION.PASSWORD_MIN_LENGTH');
    }
    return '';
  }
}
