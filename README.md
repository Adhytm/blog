# 个人技术博客 (Astro + React 版)

从 Next.js 16 全量轻量化迁移而来的个人技术博客。保留全部原创设计、视觉 Token、交互组件与文章草稿，彻底抛弃服务端运行时代价。

## 技术栈与特性

- **框架**：[Astro 5](https://astro.build/)（极速纯静态构建 + 孤岛架构）
- **UI 交互**：[React 19](https://react.dev/)（用于目录高亮、阅读进度条、命令面板搜索、主题切换）
- **样式**：Tailwind CSS v4 + 语义化设计 Token（Amber 琥珀色强调色、Apple 式留白、点阵呼吸感光晕）
- **字体**：本地自托管 Inter Variable + JetBrains Mono Variable
- **代码高亮**：Shiki 原生双主题（github-light / github-dark）+ 一键复制代码块
- **搜索**：纯前端加权搜索（Cmd/Ctrl+K 唤起，零外部服务依赖）
- **部署**：纯静态输出（`dist/`），一键直发 Cloudflare Pages / Vercel

## 目录结构

```
blog-astro/
├── src/
│   ├── components/         ← 核心交互组件（React 编写）
│   │   ├── nav.tsx             ← 顶部导航
│   │   ├── reading-progress.tsx← 顶部阅读进度条
│   │   ├── toc.tsx             ← 右侧悬浮目录
│   │   ├── search-palette.tsx  ← Cmd+K 站内搜索面板
│   │   ├── theme-toggle.tsx    ← auto/light/dark 三态主题切换
│   │   ├── post-list.tsx       ← 文章列表排序与标签筛选
│   │   ├── post-item.tsx       ← 单篇文章条目
│   │   ├── tag.tsx             ← 全站标签胶囊
│   │   └── mdx/                ← MDX 增强组件（Callout 提示框等）
│   ├── content/
│   │   ├── posts/              ← 已发布文章（.mdx）
│   │   ├── drafts/             ← 未发布草稿库（.md，全量保存）
│   │   └── projects/           ← 项目卡片
│   ├── layouts/
│   │   └── Layout.astro        ← 全站统一骨架（含防闪烁内联脚本与 SEO Meta）
│   ├── pages/                  ← 页面路由
│   │   ├── index.astro         ← 首页（Hero + 终端状态卡 + 置顶 + 最新）
│   │   ├── blog/               ← 文章列表与文章详情
│   │   ├── tags/               ← 标签云与单标签页
│   │   ├── projects.astro      ← 项目索引页
│   │   ├── about.astro         ← 关于页
│   │   ├── drafts.astro        ← 草稿箱预览页（本地可见）
│   │   ├── 404.astro           ← 404 页面
│   │   ├── search-index.json.ts← 搜索索引生成端点
│   │   └── feed.xml.ts         ← Atom 订阅生成端点
│   └── styles/
│       └── globals.css         ← 设计系统（Tailwind v4）
```

## 常用命令

```bash
# 本地开发（秒级热更新）
npm run dev

# 生产构建（约 5 秒生成全部静态 HTML/CSS/JS）
npm run build

# 本地预览打包产物
npm run preview
```

---

## 历史备忘

> **注**：这个抽象（Astro）博客是从 Next.js 16 全量迁移重构过去的。
>
> 原版经历了 Next.js 16 的多轮迭代与精细打磨（包括自研主题系统、中文 slug 解码、静态导出适配等）。为了追求极致的轻量化、更纯粹的静态输出与近乎即时的加载性能，后续将整套站点迁移重构成基于 Astro 5 孤岛架构的实现：
> - **纯静态零 JS**：博文与非交互内容不再加载多余的前端运行时；
> - **按需水合**：仅在目录高亮、阅读进度条、站内搜索和主题切换等交互组件保留 React 19；
> - **构建极速**：全量静态生成耗时从 Next.js 的 20+ 秒缩短至 4 秒左右。

