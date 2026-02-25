# ops-platform 开发规范

## 1. 项目基本信息

| 属性 | 值 |
|-----|-----|
| 项目名称 | ops-platform |
| Angular 版本 | v21 |
| 状态管理 | NgRx + Signals（混合方案） |
| 项目规模 | ~134 文件，~24,130 行代码 |
| 包管理 | pnpm |

## 2. 核心架构

### 2.1 状态管理（NgRx + Signals 混合）

**使用原则：**
- 复杂状态和跨组件共享 → NgRx
- 组件级简单状态 → Signals
- 副作用（API 调用、路由导航）→ NgRx Effects

**示例：**

```typescript
// NgRx 用于复杂状态
@Injectable({ providedIn: 'root' })
export class AuthEffects {
  loadData$ = createEffect(() =>
    this.actions$.pipe(
      ofType(LoadData),
      mergeMap(() => this.api.getData().pipe(
        map(data => LoadDataSuccess({ data })),
        catchError(error => of(LoadDataFailure({ error })))
      ))
    )
  );
}

// Signals 用于组件级状态
@Component({...})
export class MyComponent {
  readonly data = toSignal(
    this.store.select(selectData),
    { initialValue: null }
  );

  readonly isLoading = toSignal(
    this.store.select(selectLoading),
    { initialValue: false }
  );

  readonly filteredData = computed(() =>
    this.data()?.filter(item => item.active) ?? []
  );
}
```

### 2.2 存储安全架构

| 数据类型 | 存储位置 | 管理服务 | 原因 |
|---------|----------|--------|------|
| JWT Token | sessionStorage | SecureTokenService | 防止 XSS，页面刷新保持登录 |
| 用户信息 | 内存 + sessionStorage 备份 | UserCacheService | 防止 XSS，5分钟自动过期 |
| CSRF Token | sessionStorage | CsrfTokenService | 防止 CSRF |
| 权限数据 | 不存储（从后端获取） | UserApiService | 后端是权限唯一来源，不持久化 |
| 应用配置 | localStorage | StorageService | 非敏感 UI 状态，持久化 |
| 标签页 | localStorage | StorageService | 非敏感 UI 状态，持久化 |
| 语言偏好 | localStorage | StorageService | 非敏感用户偏好，持久化 |
| 主题 | localStorage | StorageService | 非敏感 UI 设置，持久化 |
| 侧边栏状态 | localStorage | StorageService | 非敏感 UI 状态，持久化 |

### 2.3 错误处理架构

**统一错误处理服务：**

```typescript
@Injectable({ providedIn: 'root' })
export class ErrorHandlerService {
  handleHttpError(error: HttpErrorResponse): AppError;
  handleError(error: any): AppError;
}
```

**在服务中使用：**

```typescript
return this.http.get<Data>('/api/data').pipe(
  catchError((error) => {
    const appError = this.errorHandler.handleError(error);
    return throwError(() => appError);
  })
);
```

## 3. 开发规范

### 3.1 组件配置

```typescript
@Component({
  selector: 'app-my-component',
  changeDetection: ChangeDetectionStrategy.OnPush,  // ✅ 必须使用
  // standalone: true,  // ✅ Angular v21+ 默认值，无需显式设置
  imports: [...],
  templateUrl: './my-component.html',
  styleUrl: './my-component.css',
  host: {
    class: 'app-my-component',
    '[class.some-class]': 'someValue',
  },
  providers: [...],
})
export class MyComponent {}
```

### 3.2 依赖注入

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

### 3.3 Signals 使用

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

// ❌ 避免：在组件中使用 observable
export class MyComponent {
  count$ = new BehaviorSubject(0);  // ❌ 应使用 signal
}
```

### 3.4 存储访问

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

### 3.5 错误处理

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

## 4. 文件组织规范

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

## 5. 安全规范

### 5.1 敏感数据保护

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

// ❌ 禁止：在前端存储和验证权限
localStorage.setItem('permissions', JSON.stringify(permissions));

// ✅ 正确：权限检查始终通过后端 API
this.permissionService.checkRoutePermission('resource/action').subscribe();
```

### 5.2 避免 XSS

```typescript
// ❌ 禁止：直接使用 innerHTML
this.renderer.setProperty(element, 'innerHTML', userInput);

// ✅ 正确：使用 Angular 的 DOM sanitization 或 ng-zorro 的安全组件
this.sanitizer.bypassSecurityTrustHtml(trustedContent); // 仅信任可信内容
this.content = userInput; // Angular 自动转义
```

### 5.3 日志安全

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

## 6. 性能规范

### 6.1 使用 OnPush 变更策略

所有组件都应配置 `ChangeDetectionStrategy.OnPush`。

### 6.2 使用 Signals 优化性能

```typescript
// ✅ 良好：使用 signals 和 computed
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

### 6.3 懰加载和代码分割

所有路由都应配置懒加载（`loadChildren`），确保：
- 关键模块按需加载
- 减少初始 bundle 大小
- 提升首屏加载速度

## 7. 开发检查清单

### 7.1 组件开发检查清单

- [ ] 使用 `ChangeDetectionStrategy.OnPush`
- [ ] 依赖注入使用 `inject()` 函数
- [ ] 组件级状态使用 signals
- [ ] 模板使用 `@if`, `@for`, `@switch` 而非 `*ngIf`, `*ngFor`
- [ ] 文件放在正确的目录

### 7.2 服务开发检查清单

- [ ] 使用 `providedIn: 'root'` 单例模式
- [ ] 依赖注入使用 `inject()` 函数
- [ ] 存储访问通过 `StorageService`
- [ ] 错误处理通过 `ErrorHandlerService`
- [ ] API 错误正确处理和重试
- [ ] 文件放在正确的目录

### 7.3 安全性检查清单

- [ ] 敏感数据不使用 `localStorage/sessionStorage`
- [ ] 权限检查通过后端 API，后端是唯一来源
- [ ] 不直接使用 `innerHTML`
- [ ] 日志不记录敏感信息
- [ ] Token 使用 `SecureTokenService`
- [ ] 用户信息使用 `UserCacheService`

### 7.4 性能检查清单

- [ ] 使用 `ChangeDetectionStrategy.OnPush`
- [ ] 复杂计算使用 `computed()`
- [ ] 避免不必要的订阅
- [ ] 路由使用懒加载

## 8. 相关文档

| 文档 | 说明 |
|------|------|
| [plan.md](./plan.md) | 详细的实施计划 |
| [AGENTS.md](./AGENTS.md) | Angular 最佳实践指南 |
| [permission.md](./permission.md) | 权限架构文档 |
| [i18n.md](./i18n.md) | 国际化开发规范 |

---

**文档版本**: 2.0
**最后更新**: 2026-02-24
**维护者**: 前端团队
