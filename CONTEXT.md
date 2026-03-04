# 项目上下文文档

> 最后更新：2026-03-04

---

## 项目定位

打造一个 AI 方向的个人品牌教育平台，对标 [HackingWithSwift](https://www.hackingwithswift.com/) 和 [Kodeco](https://www.kodeco.com/)。
核心模式：免费内容引流 → 付费课程变现 → 社区构建护城河。

---

## 品牌信息

| 项目 | 内容 |
|------|------|
| 个人品牌域名 | `lingxiaoyao.cn`（已购买） |
| 课程品牌候选 | `claudiolab.com`（未购买，可注册） |
| 目标市场 | 中国大陆 |
| 内容语言 | 中文 |

---

## 课程规划

### 第一阶段：入门课（当前重点）
- **Claude for Everyone** — 面向非技术用户，不需要编程基础
- 目标用户：知识工作者、学生、创业者、写作者
- 核心承诺：学完能把 Claude 用到日常工作里
- **价格**：¥199（定价已写入 index.mdx frontmatter，可随时调整）

#### 课程大纲
| 模块 | 内容 | 状态 |
|------|------|------|
| 模块 1 | 认识 Claude（是什么、能做什么、界面上手） | MDX 已创建（免费预览）|
| 模块 2 | 学会提问（Prompt 结构：角色 + 任务 + 背景 + 格式） | MDX 已创建（免费预览）|
| 模块 3 | Claude 用于写作（邮件、报告、改稿） | MDX 已创建（付费）|
| 模块 4 | Claude 用于思考和分析（整理思路、读文档） | 待创建 |
| 模块 5 | Claude 用于日常工作（Projects、周报、Prompt 库） | 待创建 |
| 模块 6 | 进阶思维（多轮对话、验证输出、引导付费课） | 待创建 |

### 第二阶段（后续）
- Claude 进阶课（API 开发、Agent 构建）
- Notion 课程

---

## 技术架构（已实施）

### 项目结构
```
lingxiaoyao/
├── pnpm-workspace.yaml          ✅ 已创建
├── turbo.json                   ✅ 已创建
├── package.json                 ✅ 已创建（pnpm@9）
├── tsconfig.json                ✅ 已创建
├── .gitignore                   ✅ 已创建
├── .env.example                 ✅ 已创建（复制到 apps/web/.env.local 填值）
├── scripts/
│   └── build-search-index.ts   ✅ 已创建（flexsearch 索引构建）
├── apps/
│   ├── web/                     ✅ 已创建（Next.js 15）
│   │   ├── app/
│   │   │   ├── layout.tsx       ✅ 根布局（暗色模式 + 51.la 统计）
│   │   │   ├── page.tsx         ✅ 首页
│   │   │   ├── sitemap.ts       ✅ 自动 sitemap
│   │   │   ├── robots.ts        ✅ robots.txt
│   │   │   ├── feed.xml/        ✅ RSS Feed
│   │   │   ├── articles/        ✅ 文章列表 + 详情页
│   │   │   ├── courses/         ✅ 课程列表 + 详情 + 章节页
│   │   │   ├── docs/            ✅ 文档目录 + 详情页
│   │   │   ├── dashboard/       ✅ 学习中心（已购课程 + 进度）
│   │   │   ├── about/           ✅ 关于页
│   │   │   └── api/
│   │   │       ├── auth/wechat/init/      ✅ 微信登录 URL
│   │   │       ├── auth/wechat/callback/  ✅ 微信 OAuth 回调
│   │   │       ├── auth/me/               ✅ 当前用户信息
│   │   │       ├── auth/logout/           ✅ 退出登录
│   │   │       ├── orders/create/         ✅ 创建订单 + 支付宝 URL
│   │   │       ├── orders/[id]/           ✅ 查询订单状态
│   │   │       ├── webhook/alipay/        ✅ 支付宝回调（验签+幂等）
│   │   │       ├── courses/.../video-url/ ✅ 签名视频 URL
│   │   │       ├── comments/              ✅ 评论 CRUD
│   │   │       └── progress/              ✅ 学习进度
│   │   ├── lib/
│   │   │   ├── content/articles.ts  ✅ 文章读取
│   │   │   ├── content/docs.ts      ✅ 文档读取
│   │   │   ├── content/courses.ts   ✅ 课程读取
│   │   │   ├── auth/jwt.ts          ✅ JWT 签发/验证
│   │   │   ├── auth/session.ts      ✅ Session（httpOnly Cookie）
│   │   │   ├── db/prisma.ts         ✅ Prisma Client 单例
│   │   │   ├── db/user-courses.ts   ✅ 课程权限查询
│   │   │   ├── db/progress.ts       ✅ 进度查询
│   │   │   └── rate-limit.ts        ✅ 内存限流
│   │   ├── components/
│   │   │   └── comment-section-wrapper.tsx  ✅ 评论区客户端包装
│   │   ├── prisma/
│   │   │   └── schema.prisma        ✅ 完整数据库 schema
│   │   └── content/                 ✅ MDX 内容目录
│   │       ├── articles/            ✅ 2篇示例文章
│   │       ├── docs/                ✅ 2篇示例文档
│   │       └── courses/claude-for-everyone/  ✅ 3章示例内容
│   └── desktop/                     ✅ Tauri 2.x 骨架
│       ├── src-tauri/
│       │   ├── tauri.conf.json      ✅ lingxiaoyao:// scheme
│       │   ├── Cargo.toml           ✅
│       │   └── src/lib.rs           ✅ deep-link 处理
│       └── src/auth.ts              ✅ 桌面端微信登录流程
└── packages/
    ├── ui/                          ✅ shadcn/ui 共享组件库
    │   ├── src/components/button.tsx        ✅
    │   ├── src/components/video-player.tsx  ✅ xgplayer 封装
    │   ├── src/components/wechat-follow-card.tsx  ✅
    │   ├── src/components/comment-section.tsx     ✅
    │   └── src/components/progress-button.tsx     ✅
    ├── types/                       ✅ 共享 TypeScript 类型
    └── config/                      ✅ 共享 tailwind/tsconfig
```

### 技术选型（最终确定）

| 层 | 技术 |
|----|------|
| Web 框架 | Next.js 15 (App Router) |
| 桌面框架 | Tauri 2.x |
| 包管理 | pnpm 9 + TurboRepo |
| UI 组件 | shadcn/ui + Tailwind CSS |
| 视频播放器 | xgplayer（西瓜播放器）|
| 内容管理 | MDX 文件（next-mdx-remote）|
| 数据库 | PostgreSQL + Prisma ORM |
| 视频托管 | 腾讯云点播（VOD）|
| 微信登录 | 微信开放平台 OAuth 2.0 |
| 支付 | 支付宝（alipay-sdk-nodejs-all）|
| 评论系统 | 自建（comments 表）|
| 学习进度 | 自建（user_progress 表）|
| 全文搜索 | flexsearch（本地构建索引）|
| 暗色模式 | next-themes |
| 统计分析 | 51.la |
| 图片 CDN | 腾讯云 COS |

---

## 网站页面结构（已实现）

| 路由 | 说明 | 权限 |
|------|------|------|
| `/` | 首页 | 公开 |
| `/articles` | 文章列表（分类/系列筛选）| 公开 |
| `/articles/[slug]` | 单篇文章 + 评论 + 进度标记 | 公开 |
| `/docs` | 文档目录 | 公开 |
| `/docs/[...slug]` | 单篇文档 + 进度标记 | 公开 |
| `/courses` | 课程列表 | 公开 |
| `/courses/[slug]` | 课程详情 + 章节列表 + 购买入口 | 公开展示 |
| `/courses/[slug]/[chapter]` | 章节视频 + 图文 + 评论 | 付费用户（免费章节公开）|
| `/dashboard` | 我的课程 + 学习进度 | 登录用户 |
| `/about` | 关于我 + 微信公众号引导 | 公开 |

---

## 下一步行动

### 立即可做
1. **安装依赖**：进入 `apps/web` 目录，运行 `pnpm install`
2. **配置环境变量**：复制 `.env.example` 到 `apps/web/.env.local` 并填写
3. **初始化数据库**：`cd apps/web && npx prisma migrate dev --name init`
4. **启动开发服务器**：`pnpm dev`（在根目录）

### 待完成功能
- [ ] 注册 `claudiolab.com` 作为课程品牌域名（待决定）
- [ ] 微信公众号名称（待决定）
- [ ] 申请微信开放平台账号（需要营业执照）
- [ ] 申请支付宝开放平台账号（需要营业执照）
- [ ] 腾讯云 VOD 申请并上传课程视频
- [ ] 国内服务器 ICP 备案（约20天）
- [ ] 完善 Claude for Everyone 剩余3章 MDX 内容
- [ ] 实现腾讯云 VOD 真实签名 URL 逻辑（当前为占位符）
- [ ] 添加导航栏组件（Header/Nav）
- [ ] 首次部署流程
- [ ] 微信公众号二维码（需申请后填入 WechatFollowCard）
- [ ] 搜索功能前端 UI（SearchBar 组件）

### 开发期临时方案
- 支付宝 Webhook 测试：用 ngrok 暴露本地端口
  ```bash
  ngrok http 3000
  # 将 ngrok URL 设置到 ALIPAY_NOTIFY_URL
  ```

---

## 待决定事项

- [ ] 是否注册 `claudiolab.com` 作为课程品牌域名
- [ ] 微信公众号名称
- [ ] 第一批免费内容选题（已有2篇示例文章）
- [ ] 课程定价（当前设为 ¥199，可调整）
