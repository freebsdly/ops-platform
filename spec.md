# ops-platform 项目架构规范文档

## 1. 项目基本信息

| 属性 | 值 |
|-----|-----|
| 项目名称 | ops-platform |
| Angular 版本 | v21 |
| 状态管理 | NgRx + Signals（混合方案） |
| 项目规模 | ~134 文件，~24,130 行代码 |
| 包管理 | pnpm |

## 2. 已完成的架构优化

### 2.1 阶段3：安全性增强 ✅

- ✅ **安全Token存储**：创建 `SecureTokenService`，使用 sessionStorage 存储认证 token
- ✅ **用户信息存储**：创建 `UserCacheService`，用户信息仅在内存中缓存
- ✅ **CSRF 防护**：`CsrfTokenService` + `CsrfInterceptor`，CSRF Token 存储在 sessionStorage
- ✅ **错误处理**：创建 `ErrorHandlerService`，统一的错误处理和日志管理

### 2.2 阶段4：存储架构优化 ✅

- ✅ **StorageService 抽象层**：统一的存储管理接口，支持 localStorage、sessionStorage 和内存存储
- ✅ **重构现有服务**：
  - ConfigService → 使用 StorageService
  - TabBar → 使用 StorageService
  - LangSelector → 使用 StorageService
  - LayoutEffects → 使用 StorageService

### 2.3 阶段1：Signals 集成 ✅

- ✅ **混合方案**：使用 `toSignal()` 将将 NgRx selectors 转换为 signals
- ✅ **双轨并存**：新代码优先使用 signals，旧代码继续使用 observables

## 3. 当前架构设计

### 3.1 状态管理架构（NgRx + Signals 混合）

```typescript
// NgRx 用于复杂状态和副作用
@Injectable({ providedIn: 'root' })
export class AuthEffects {
  // 处理登录、登出等副作用
}

// Signals 用于组件级状态
@Component({...})
export class MyComponent {
  // 通过 toSignal() 将 NgRx selectors 转换为 signals
  readonly isAuthenticated = toSignal(
    this.store.select(AuthSelectors.selectIsAuthenticated),
    { initialValue: false }
  );
  
  readonly user = toSignal<User | null>(
    this.store.select(AuthSelectors.selectUser),
    { initialValue: null }
  );
}
```

**使用原则**：
- 复杂状态和跨组件共享 → NgRx
- 组件级简单状态 → Signals
- 副作用（API 调用、路由导航）→ NgRx Effects

### 3.2 存储安全架构

| 数据类型 | 存储位置 | 管理服务 | 原因 |
|---------|----------|--------|------|
| JWT Token | sessionStorage | SecureTokenService | 防止xSS，页面刷新保持登录 |
| 用户信息 | 内存 + sessionStorage备份 | UserCacheService | 防止xSS，5分钟自动过期 |
| CSRF Token | sessionStorage | CsrfTokenService | 防止CSRF |
| 应用配置 | localStorage | StorageService | 非敏感UI状态，持久化 |
| 标签页 | localStorage | StorageService | 非敏感UI状态，持久化 |
| 语言偏好 | localStorage | StorageService | 非�敏感用户偏好，持久化 |
| 主题 | localStorage | StorageService | 非�敏感UI设置，持久化 |
| 侧边栏状态 | localStorage | StorageService | 非�敏感UI状态，持久化 |

### 3.3 错误处理架构

```typescript
// 统一错误处理服务
@Injectable({ providedIn: 'root' })
export class ErrorHandlerService {
  handleHttpError(error: HttpErrorResponse): AppError;
  handleError(error: any): AppError;
}

// API 拦截器自动使用
export class ApiResponseInterceptor implements HttpInterceptor {
  private errorHandler = inject(ErrorHandlerService);
  
  intercept(request: HttpRequest<unknown>, next: HttpHandler) {
    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        const appError = this.errorHandler.handleHttpError(error);
        return throwError(() => appError);
      })
    );
  }
}
```

## 4. 开发规范

### 4.1 组件配置

```typescript
@Component({
  selector: 'app-my-component',
  // ✅ 必须使用
  changeDetection: ChangeDetectionStrategy.OnPush,
  // ✅ 推荐使用（Angular v20+ 默认）
  standalone: true,
  imports: [...],
  templateUrl: './my-component.html',
  styleUrl: './my-component.css',
  // ✅ 推荐使用（NgRx v17+ 默认）
  host: {
    class: 'app-my-component',
    '[class.some-class]': 'some-value',
  },
  providers: [...],
})
export class MyComponent {}
```

### 4.2 依赖注入

```typescript
// ✅ 正确：使用 inject() 函数
export class MyComponent {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly storageService = inject(StorageService);
}

// ❌ 错误：构造函数注入（旧方式）
export class MyComponent {
  constructor(
    private authService: AuthService,
    private router: Router,
    private storageService: StorageService
  ) {}
}
```

### 4.3 Signals 使用

```typescript
@Component({...})
export class MyComponent {
  // ✅ 组件级状态使用 signals
  private readonly count = signal(0);
  private readonly doubled = computed(() => this.count() * 2);
  
  increment() {
    this.count.update(c => c + 1);
  }
}

// ❌ 避免：使用 observable
count$ = new BehaviorSubject(0);
```

### 4.4 存储访问

```typescript
// ✅ 正确：通过 StorageService
export class MyService {
  private readonly storageService = inject(StorageService);
  
  saveConfig(config: MyConfig) {
    this.storageService.setItem('my_config', config, {
      type: StorageType.LOCAL,
      ttl: 7 * 24 * 60 * 60 * 1000 // 7天
    });
  }
  
  getConfig(): MyConfig | null {
    return this.storageService.getItem<MyConfig>('my_config', {
      type: StorageType.LOCAL
    });
  }
}

// ❌ 错误：直接访问 localStorage/sessionStorage
export class MyService {
  saveConfig(config: MyConfig) {
    localStorage.setItem('my_config', JSON.stringify(config));
  }
}
```

### 4.5 错误处理

```typescript
// ✅ 正确：使用 ErrorHandlerService
export class MyService {
  private readonly http = inject(HttpClient);
  private readonly errorHandler = inject(ErrorHandlerService);
  
  fetchData() {
    return this.http.get<Data>('/api/data').pipe(
      catchError((error) => {
        const appError = this.errorHandler.handleError(error);
        return throwError(() => appError);
      })
    );
  }
}

// ❌ 错误：手动处理错误
export class MyService {
  fetchData() {
    return this.http.get<Data>('/api/data').pipe(
      catchError((error) => {
        console.error('Error:', error);
        return throwError(() => 'Failed to load data');
      })
    );
  }
}
```

## 5. 文件组织规范

| 文件类型 | 目录路径 |
|---------|----------|
| 服务文件 | `src/app/core/services/` |
| 类型文件 | `src/app/core/types/` |
| 拦截器 | `src/app/core/interceptors/` |
| Effects | `src/app/core/stores/*/` |
| Reducers | `src/app/core/stores/*/` |
| Selectors | `src/app/core/stores/*/` |
| Actions | `src/app/core/stores/*/` |
| 布局组件 | `src/app/layout/` |
| 页面组件 | `src/app/pages/` |
| Pipes | `src/app/core/pipes/` |
| Directives | `src/app/core/directives/` |
| Guards | `src/app/guards/` |

## 6. 后续开发指南

### 6.1 添加新服务时如何存储数据

```typescript
// 1. 非敏感数据（认证相关、个人信息）
@Injectable({ providedIn: 'root' })
export class MyAuthRelatedService {
  private readonly storageService = inject(StorageService);
  
  saveSecretData(data: string) {
    // 使用 sessionStorage，页面关闭自动清除
    this.storageService.setItem('my_secret', data, {
      type: StorageType.SESSION,
      ttl: 24 * 60 * 60 * 1000 // 24小时
    });
  }
  
  getSecretData(): string | null {
    return this.storageService.getItem<string>('my_secret', {
      type: StorageType.SESSION
    });
  }
}

// 2. 非敏感用户偏好
@Injectable({ providedIn: 'root' })
export class MyPreferenceService {
  private readonly storageService = inject(StorageService);
  
  savePreference(pref: MyPreference) {
    // 使用 localStorage，持久化
    this.storageService.setItem('my_pref', pref, {
      type: StorageType.LOCAL,
      ttl: 7 * 24 * 60 * 60 * 1000 // 7天
    });
  }
  
  getPreference(): MyPreference | null {
    return this.storageService.getItem<MyPreference>('my_pref', {
      type: StorageType.LOCAL
    });
  }
}

// 3. 临时数据（会话、缓存）
@Injectable({ providedIn: 'root' })
export class MyCacheService {
  private readonly storageService = inject(StorageService);
  
  cacheData(data: any): void {
    // 使用内存存储，页面刷新清除
    this.storageService.setItem('my_cache', data, {
      type: StorageType.MEMORY,
      ttl: 5 * 60 * 1000 // 5分钟
    });
  }
  
  getCachedData(): any | null {
    return this.storageService.getItem('my_cache', {
      type: StorageType.MEMORY
    });
  }
}
```

### 6.2 添加新组件时如何使用状态

```typescript
// 1. 组件级简单状态 → 使用 signals
@Component({...})
export class MyNewComponent {
  private readonly myService = inject(MyService);
  
  // 组件级状态
  private readonly data = signal<MyData | null>(null);
  private readonly loading = signal(false);
  private readonly error = signal<string | null>(null);
  
  ngOnInit() {
    this.loadData();
  }
  
  private loadData() {
    this.loading.set(true);
    this.error.set(null);
    
    this.myService.getData().subscribe({
      next: (data) => {
        this.data.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(err.message);
        this.loading.set(false);
      }
    });
  }
}

// 2. 跨组件共享状态 → 使用 NgRx
// 在 Effects 中加载
@Injectable({ providedIn: 'root' })
export class MyEffects {
  loadData$ = createEffect(() =>
    this.actions$.pipe(
      ofType(LoadMyData),
      mergeMap(() =>
        this.myService.loadData().pipe(
          map(data => LoadMyDataSuccess({ data })),
          catchError(error => of(LoadMyDataFailure({ error })))
        )
    )
  );
}

// 在组件中使用 signals
export class MyComponent {
  readonly myData = toSignal(
    this.store.select(selectMyData),
    { initialValue: null }
  );
  
  readonly isLoading = toSignal(
    this.store.select(selectMyLoading),
    { initialValue: false }
  );
}
```

### 6.3 添加新功能时如何处理错误

```typescript
// 1. API 错误
@Injectable({ providedIn: 'root' })
export class MyApiService {
  private readonly http = inject(HttpClient);
  private readonly errorHandler = inject(ErrorHandlerService);
  
  fetchData(): Observable<Data> {
    return this.http.get<Data>('/api/data').pipe(
      catchError((error) => {
        const appError = this.errorHandler.handleError(error);
        return throwError(() => appError);
      })
    );
  }
}

// 2. 同步操作错误
@Injectable({ providedIn: 'root' })
export class MyService {
  private readonly message = inject(NzMessageService);
  private readonly errorHandler = inject(ErrorHandlerService);
  
  async processData(): Promise<void> {
    try {
      await this.doSomething();
    } catch (error) {
      const appError = this.errorHandler.handleError(error);
      this.message.error(appError.userMessage);
      
      // 根据错误类型决定是否重试
      if (appError.type === ErrorType.NETWORK) {
        // 网络错误，不重试
        return;
      } else if (appError.type === ErrorType.AUTHENTICATION) {
        // 认证错误，跳转到登录
        this.router.navigate(['/login']);
        return;
      }
    }
  }
}
```

### 6.4 保持与现有架构一致

**检查清单**：
- [ ] 组件使用 `ChangeDetectionStrategy.OnPush`
- [ ] 依赖注入使用 `inject()` 函数
- [ ] 存储访问通过 `StorageService`
- [ ] 错误处理通过 `ErrorHandlerService`
- [ ] 敏感数据不使用 `localStorage/sessionStorage`
- [ ] 文件放在正确的目录
- [ ] 组件放在正确的目录

## 7. 安全编码规范

### 7.1 敏感数据保护

```typescript
// ❌ 禁止：将敏感数据存储在 localStorage
localStorage.setItem('auth_token', token);

// ✅ 正确：使用 SecureTokenService
this.secureTokenService.setToken(token, maxAge);

// ❌ 禁止：将用户信息存储在 localStorage/sessionStorage
localStorage.setItem('user', JSON.stringify(user));
sessionStorage.setItem('user', JSON.stringify(user));

// ✅ 正确：使用 UserCacheService（内存缓存）
this.userCacheService.setUser(user);
const user = this.userCacheService.getUser();
```

### 7.2 避免 XSS

```typescript
// ❌ 禁止：直接使用 innerHTML
this.renderer.setProperty(element, 'innerHTML', userInput);

// ✅ 正确：使用 Angular 的 DOM sanitization 或 ng-zorro 的安全组件
this.sanitizer.bypassSecurityTrust(UserSecurity); // 仅信任可信内容
this.content = userInput;
```

### 7.3 日志安全

```typescript
// ❌ 禁止：记录敏感信息
console.log('User logged in:', user);
console.log('Token:', token);

// ✅ 正确：记录安全的日志
console.log('User logged in:', user.username);
console.log('Authentication successful');

// 记录错误时不要暴露敏感信息
console.error('Login failed:', error.message); // OK
console.error('Login failed:', error); // 可能暴露敏感信息
```

## 8. 性能优化规范

### 8.1 使用 OnPush 变更策略

所有组件都应配置 `ChangeDetectionStrategy.OnPush`。

### 8.2 使用 signals 优化性能

```typescript
// ✅ 良效：使用 signals 和 computed
@Component({...})
export class MyComponent {
  private readonly data = signal<Data | null>(null);
  private readonly filteredData = computed(() => 
    this.data()?.filter(item => item.active) ?? []
  );
  private readonly count = computed(() => 
    this.filteredData().length
  );
}

// ❌ 低效：手动更新和订阅
data$ = new BehaviorSubject<Data | null>(null);
filteredData$ = new BehaviorSubject<[]>([]);
count$ = new BehaviorSubject<number>(0);

this.data$.subscribe(data => {
  const filtered = data?.filter(item => item.active) ?? [];
  this.filteredData$.next(filtered);
  this.count$.next(filtered.length);
});
```

### 8.3 懰加载和代码分割

所有路由都已配置懒加载（`loadChildren`），确保：
- 关键模块按需加载
- 减少初始 bundle 大小
- 提升首屏加载速度

## 9. 相关文档

- [plan.md](./plan.md) - 详细的实施计划
- [AGENTS.md](./AGENTS.md) - Angular 最佳实践指南

---

**文档版本**: 1.0  
**最后更新**: 2026-02-24  
**维护者**: 前端团队
