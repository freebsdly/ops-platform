# OpsPlatform

基于 Angular v21 的 DevOps 平台，采用 NgRx + Signals 混合架构，支持完整的权限管理、国际化和安全存储。

## 快速开始

### 安装依赖

```bash
pnpm install
```

### 启动开发服务器

```bash
pnpm run dev
```

访问 http://localhost:4200/

### 运行测试

```bash
# 运行所有测试
pnpm test

# 运行单元测试
pnpm test:unit

# 运行端到端测试
pnpm test:e2e
```

### 构建生产版本

```bash
pnpm run build
```

构建产物将输出到 `dist/` 目录。

## 开发指南

### 项目文档

本项目包含完整的开发规范文档：

| 文档 | 说明 |
|------|------|
| [AGENTS.md](./AGENTS.md) | **AI 开发指南** - 标准化配置，兼容多种 AI 代理 |
| [spec.md](./spec.md) | **项目开发规范** - 架构、安全、性能规范 |
| [permission.md](./permission.md) | **权限架构** - RBAC + Resource-Based 混合权限模型 |
| [i18n.md](./i18n.md) | **国际化规范** - 多语言开发指南 |
| [plan.md](./plan.md) | **实施计划** - 权限系统优化路线图 |

### AI 辅助开发

本项目配置了 **AGENTS.md** 标准，支持以下 AI 代理：

- ✅ OpenAI Codex
- ✅ Cursor
- ✅ Google Jules
- ✅ GitHub Copilot
- ✅ Aider

AI 代理会自动：
1. 读取项目规范（AGENTS.md、spec.md）
2. 执行正确的命令（pnpm install、pnpm test）
3. 遵循 Angular 官方最佳实践
4. 遵守项目特定的安全架构

### 代码规范

- **TypeScript**: 严格模式
- **Angular**: v21+，使用 standalone components
- **状态管理**: NgRx（复杂状态）+ Signals（组件状态）
- **样式**: 单引号，无分号（Prettier 配置）
- **依赖注入**: 使用 `inject()` 函数

### 核心特性

#### 权限系统

- **RBAC + Resource-Based** 混合权限模型
- **多层防护**: 路由守卫、指令、管道、API 验证
- **后端为唯一来源**: 权限数据从后端获取，不持久化
- **短期缓存**: 1分钟 TTL，仅为性能优化

#### 存储安全

- **JWT Token**: sessionStorage（防 XSS）
- **用户信息**: 内存 + sessionStorage 备份（5分钟过期）
- **CSRF Token**: sessionStorage
- **权限数据**: 不存储，始终从后端获取
- **应用配置**: localStorage

#### 状态管理

- **NgRx**: 复杂状态和副作用（API 调用、路由导航）
- **Signals**: 组件级简单状态
- **混合架构**: 使用 `toSignal()` 转换 NgRx Selectors

#### 国际化

- 支持 **中文** 和 **英文**
- 使用 `@ngx-translate/core` 和 `ng-zorro-antd/i18n`
- 所有用户可见文本必须使用翻译管道

## 项目结构

```
src/
├── app/
│   ├── core/              # 核心功能
│   │   ├── services/     # 服务（StorageService, ErrorHandlerService 等）
- │   ├── stores/       # NgRx Store
│   │   ├── types/        # 类型定义
│   │   ├── interceptors/  # HTTP 拦截器
│   │   ├── pipes/        # 管道
│   │   └── directives/   # 指令
│   ├── layout/ares         # 布局组件
│   ├── pages/             # 页面组件
│   ├── guards/            # 路由守卫
│   └── config/            # 配置文件
├── assets/
│   └── i18n/            # 国际化翻译文件
└─── ...                # 其他配置文件
```

## 贡献指南

### 开发流程

1. 阅读 [AGENTS.md](./AGENTS.md) 了解项目规范
2. 阅读 [spec.md](./spec.md) 了解项目架构
3. 创建功能分支：`git checkout -b feat/my-feature`
4. 进行开发
`   - 遵循 Angular 最佳实践
   - 遵守项目安全规范
   - 使用 `pnpm test` 验证
   - 使用 `pnpm lint` 检查代码风格
5. 提交代码：`git commit -m "feat: add my feature"`
6. 推送分支：`git push origin feat/my-feature`
7. 创建 Pull Request

### 提交信息规范

遵循 [Conventional Commits](https://www.conventionalcommits.org/) 格式：

- `feat:` 新功能
- `fix:` Bug 修复
- `refactor:` 代码重构
- `docs:` 文档更新
- `test:` 测试相关
- `chore:` 构建/工具链更新

示例：
```bash
git commit -m "feat: add permission audit logging"
git commit -m "fix: resolve user cache persistence issue"
```

### 代码审查

- 所有代码必须通过 CI 检查
- 测试覆盖率应保持 > 80%
- 必须通过 ESLint 和 TypeScript 检查
- 必须通过无障碍性检查（AXE）

## 部署

### 生产构建

```bash
pnpm run build
```

### 环境变量

创建 `.env.production` 文件：

```env
API_BASE_URL=https://api.example.com
```

## 技术栈

| 技术 | 版本 | 用途 |
|------|------|------|
| Angular | v21 | 框架 |
| NgRx | v21 | 状态管理 |
| ng-zorro-antd | v21 | UI 组件库 |
| @ngx-translate | v17 | 国际化 |
| pnpm | 10+ | 包管理器 |
| Vitest | Latest | 单元测试 |
| Playwright | Latest | E2E 测试 |

## 许可证

[MIT License](./LICENSE)

## 联系方式

- 项目维护者: 前端团队
- 文档版本: 2.0
- 最后更新: 2026-02-24

## 相关资源

- [Angular 文档](https://angular.dev)
- [NgRx 文档](https://ngrx.io)
- [ng-zorro-antd](https://ng.ant.design)
- [AGENTS.md 标准](https://agents.md/)
