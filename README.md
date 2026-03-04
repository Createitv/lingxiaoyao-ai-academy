<p align="center">
  <img src="icon.png" width="128" height="128" alt="林逍遥AI">
</p>

<h1 align="center">林逍遥AI</h1>

<p align="center">
  AI 方向的个人品牌教育平台 —— 免费内容引流 · 付费课程变现 · 社区构建护城河
</p>

<p align="center">
  <a href="https://lingxiaoyao.cn">官网</a> ·
  <a href="#课程">课程</a> ·
  <a href="#快速开始">快速开始</a>
</p>

---

## 项目简介

林逍遥AI 是一个面向中文用户的 AI 教育平台，提供从入门到进阶的 AI 课程、技术文章和文档资源。平台同时提供 Web 端和桌面客户端。

## 技术栈

| 层 | 技术 |
|----|------|
| Web 框架 | Next.js 15 (App Router) |
| 桌面客户端 | Tauri 2.x |
| 包管理 | pnpm 9 + TurboRepo |
| UI 组件 | shadcn/ui + Tailwind CSS |
| 内容管理 | MDX (next-mdx-remote) |
| 数据库 | PostgreSQL + Prisma ORM |
| 视频播放 | xgplayer |
| 认证 | 微信 OAuth 2.0 + JWT |
| 支付 | 支付宝 |
| 搜索 | FlexSearch |

## 项目结构

```
lingxiaoyao/
├── apps/
│   ├── web/              # Next.js 15 Web 应用
│   │   ├── app/          # 页面与 API 路由
│   │   ├── lib/          # 业务逻辑（认证、数据库、内容读取）
│   │   ├── prisma/       # 数据库 Schema 与迁移
│   │   └── content/      # MDX 内容（文章、课程、文档）
│   └── desktop/          # Tauri 2.x 桌面客户端
├── packages/
│   ├── ui/               # 共享 UI 组件库 (shadcn/ui)
│   ├── types/            # 共享 TypeScript 类型
│   └── config/           # 共享 Tailwind / TSConfig
└── scripts/              # 构建脚本（搜索索引等）
```

## 课程

### Claude for Everyone（首发课程）

面向非技术用户的 Claude AI 入门课，不需要编程基础。

| 模块 | 内容 |
|------|------|
| 模块 1 | 认识 Claude — 是什么、能做什么、界面上手 |
| 模块 2 | 学会提问 — Prompt 结构：角色 + 任务 + 背景 + 格式 |
| 模块 3 | Claude 用于写作 — 邮件、报告、改稿 |
| 模块 4 | Claude 用于思考和分析 — 整理思路、读文档 |
| 模块 5 | Claude 用于日常工作 — Projects、周报、Prompt 库 |
| 模块 6 | 进阶思维 — 多轮对话、验证输出 |

## 快速开始

### 前置要求

- Node.js 20+
- pnpm 9+
- PostgreSQL
- Rust（仅桌面端需要）

### 安装与运行

```bash
# 克隆项目
git clone https://github.com/Createitv/lingxiaoyao.git
cd lingxiaoyao

# 安装依赖
pnpm install

# 配置环境变量
cp .env.example apps/web/.env.local

# 初始化数据库
cd apps/web && npx prisma migrate dev --name init && cd ../..

# 启动开发服务器
pnpm dev:web
```

### 桌面端开发

```bash
# 需要 Rust 环境
pnpm dev:app
```

### 构建桌面客户端

```bash
cd apps/desktop && pnpm build
```

推送 `v*` tag 会自动触发 GitHub Actions 构建 macOS（Universal）和 Windows 安装包并发布到 Release。

## 页面路由

| 路由 | 说明 | 权限 |
|------|------|------|
| `/` | 首页 | 公开 |
| `/articles` | 文章列表 | 公开 |
| `/articles/[slug]` | 文章详情 + 评论 | 公开 |
| `/courses` | 课程列表 | 公开 |
| `/courses/[slug]` | 课程详情 + 购买 | 公开 |
| `/courses/[slug]/[chapter]` | 章节学习 | 付费 / 免费预览 |
| `/docs` | 文档中心 | 公开 |
| `/dashboard` | 学习中心 | 登录用户 |
| `/about` | 关于 | 公开 |

## 环境变量

复制 `.env.example` 到 `apps/web/.env.local` 并填写实际值。

开发环境的覆盖配置见 `apps/web/.env.development`（`next dev` 自动加载）。

主要配置项：
- **DATABASE_URL** — PostgreSQL 连接字符串
- **JWT_SECRET** — JWT 签名密钥
- **WECHAT_APP_ID / SECRET** — 微信开放平台
- **ALIPAY_*** — 支付宝配置
- **TENCENT_*** — 腾讯云 VOD / COS

## License

MIT
