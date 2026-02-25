# AGENTS.md

## Setup commands

- Install dependencies: `pnpm install`
- Start dev server: `pnpm run dev`
- Run tests: `pnpm test`
- Run linter: `pnpm lint`

## Code style

This project follows Angular official AI development guidelines:

### TypeScript Best Practices

- Use strict type checking
- Prefer type inference when type is obvious
- Avoid `any` type; use `unknown` when type is uncertain

### Angular Best Practices

- Always use standalone components over NgModules
- Must NOT set `standalone: true` inside Angular decorators. It's default in Angular v20+.
- Use signals for state management
- Implement lazy loading for feature routes
- Do NOT use `@HostBinding` and `@HostListener` decorators. Put host bindings inside `host` object of `@Component` or `@Directive` decorator instead
- Use `NgOptimizedImage` for all static images.
  - `NgOptimizedImage` does not work for inline base64 images.

### Accessibility Requirements

- It MUST pass all AXE checks.
- It MUST follow all WCAG AA minimums, including focus management, color contrast, and ARIA attributes.

### Components

- Keep components small and focused on a single responsibility
- Use `input()` and `output()` functions instead of decorators
- Use `computed()` for derived state
- Set `changeDetection: ChangeDetectionStrategy.OnPush` in `@Component` decorator
- Prefer inline templates for small components
- Prefer Reactive forms instead of Template-driven ones
- Do NOT use `ngClass`, use `class` bindings instead
- Do NOT use `ngStyle`, use `style` bindings instead
- When using external templates/styles, use paths relative to the component TS file.

### State Management

- Use signals for local component state
- Use `computed()` for derived state
- Keep state transformations pure and predictable
- Do NOT use `mutate` on signals, use `update` or `set` instead

### Templates

- Keep templates simple and avoid complex logic
- Use native control flow (`@if`, `@for`, `@switch`) instead of `*ngIf`, `*ngFor`, `*ngSwitch`)
- Use async pipe to handle observables
- Do not assume globals like (`new Date()`) are available.
- Do not write arrow functions in templates (they are not supported).

### Services

- Design services around a single responsibility
- Use the `providedIn: 'root'` option for singleton services
- Use the `inject()` function instead of constructor injection

## Testing instructions

- Run all tests: `pnpm test`
- Run unit tests: `pnpm test:unit`
- Run e2e tests: `pnpm test:e2e`
- Tests must pass before committing
- For a single test file: `pnpm test -- --include <file-name>`
- Generate coverage: `pnpm test --coverage`

## Development workflow

1. Read `spec.md` for project-specific architecture and conventions
2. Read feature-specific docs if applicable:
   - `permission.md` for permission-related changes
   - `i18n.md` for internationalization changes
3. Make code changes following Angular best practices
4. Run `pnpm test` to verify all tests pass
5. Run `pnpm lint` to check code style
6. Fix any test or lint errors before committing

## Project-specific guidelines

### Permission System

- Read `permission.md` for permission architecture
- **Critical**: Permissions must come from backend API only
- Do not store permissions in localStorage/sessionStorage
- Use `PermissionService.checkRoutePermission()` for all permission checks

### Internationalization

- Read `i18n.md` for i18n guidelines
- All user-visible text must use translations
- Never hardcode text in templates or TypeScript
- Use `| translate` pipe in templates
- Translation keys must use UPPER_SNAKE_CASE format

### State Management

- Complex state and cross-component sharing → NgRx
- Component-level simple state → Signals
- Side effects (API calls, routing) → NgRx Effects
- Use `toSignal()` to convert NgRx selectors to signals

### Storage Security

- Sensitive data → Do not use localStorage/sessionStorage
- Auth tokens → Use `SecureTokenService` (sessionStorage)
- User info → Use `UserCacheService` (memory + sessionStorage backup)
- Permissions → Do not store, fetch from backend API
- App preferences → Use `StorageService` (localStorage)

### File Organization

- Services: `src/app/core/services/`
- Types: `src/app/core/types/`
- Interceptors: `src/app/core/interceptors/`
- Store: `src/app/core/stores/`
- Layout components: `src/app/layout/`
- Page components: `src/app/pages/`
- Pipes: `src/app/core/pipes/`
- Directives: `src/app/core/directives/`
- Guards: `src/app/guards/`

## Security considerations

- Never store sensitive data in localStorage
- Never hardcode credentials or API keys
- Use `SecureTokenService` for authentication tokens
- Use `ErrorHandlerService` for consistent error handling
- All permission checks must go through backend API
- Log errors without exposing sensitive information

## Performance best practices

- Use `ChangeDetectionStrategy.OnPush` for all components
- Use `computed()` for derived state
- Implement lazy loading for feature routes
- Avoid unnecessary subscriptions
- Use signals for component state instead of observables
- Use `NgOptimizedImage` for static images

## Commit guidelines

- Title should be concise and descriptive
- Run `pnpm test` and `pnpm lint` before committing
- Commit messages should follow conventional commits format:
  - `feat:` for new features
  - `fix:` for bug fixes
  - `refactor:` for code refactoring
  - `docs:` for documentation changes
  - `test:` for test changes
  - `chore:` for maintenance tasks

## Related documentation

- [spec.md](./spec.md) - Project architecture and conventions
- [permission.md](./permission.md) - Permission system architecture
- [i18n.md](./i18n.md) - Internationalization guidelines
- [plan.md](./plan.md) - Implementation roadmap

---

**Last updated**: 2026-02-24
**Follows**: Angular Official AI Development Guide
**Compatible with**: OpenAI Codex, Cursor, Jules, Aider, and other AGENTS.md-compatible agents
