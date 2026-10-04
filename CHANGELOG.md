# 博客演进史与全版本日志 (Changelog)

> 本文档完整梳理了从 **Next.js 16 原版** 到 **Astro 5 重构版** 的所有功能演进、核心踩坑修复、架构取舍与资产对照。供随时查阅，无需翻找 Git 历史。

---

## 一、核心资产对照（确认无遗漏）

| 资产类型 | Next.js 版 (`blog/`) | Astro 版 (`blog-astro/`) | 迁移核对状态 |
| :--- | :--- | :--- | :---: |
| **已发布博文 (5篇)** | `content/posts/*.mdx` | `src/content/posts/*.mdx` | ✅ **100% 完整平移，零丢失** |
| ├─ 《Next.js 16 把我的中文路由搞 404 了》 | `nextjs16-中文路由404排查记.mdx` | 同名 | ✅ 存在 |
| ├─ 《现阶段为什么选择调用 DeepSeek API》 | `api还是自建-成本账.mdx` | 同名 | ✅ 存在 |
| ├─ 《数据清洗两个月，最棘手的问题不是技术栈》| `数据清洗两个月.mdx` | 同名 | ✅ 存在 |
| ├─ 《异构多卡环境的 GPU 隔离踩坑笔记》 | `异构多卡GPU隔离踩坑.mdx` | 同名 | ✅ 存在 |
| └─ 《你好，世界》 | `你好世界-博客怎么搭的.mdx` | 同名 | ✅ 存在 |
| **未发布草稿 (6篇)** | `content/posts/draft/*.md` | `src/content/drafts/*.md` | ✅ **100% 完整保留** |
| ├─ 《安全.md》 | 存在 | 存在 | ✅ |
| ├─ 《定价趋势.md》 | 存在 | 存在 | ✅ |
| ├─ 《细谈定价趋势.md》 | 存在 | 存在 | ✅ |
| ├─ 《灵感库.md》 | 存在 | 存在 | ✅ |
| ├─ 《数据清洗.md》 | 存在 | 存在 | ✅ |
| └─ 《我在1660s和5060ti混合环境部署vllm...》| 存在 | 存在 | ✅ |
| **项目卡片 (1个)** | `content/projects/这个博客.md` | `src/content/projects/这个博客.md` | ✅ **完整保留** |
| **视觉资产** | `public/og.png`, `public/favicon.ico` | `public/` 同步覆盖 | ✅ **完整保留** |

---

## 二、时期回顾：Next.js 16 原版 (2026.07 - 2026.09)

> **定位**：探索与打磨完整功能的个人技术博客原型。技术栈为 Next.js 16 (App Router + Turbopack) + React 19 + Tailwind CSS v4。

### 1. 核心功能实现
- **设计系统**：确定 Apple 式极简留白风格，以 Amber 琥珀色（`#d97706` / `#f59e0b`）为单一强调色，确立 `//` 代码注释式设计语言（终端状态卡片、代码化签名行）。
- **MDX 渲染管线**：配置 `rehype-slug`（标题 ID 提取）+ `rehype-pretty-code`（Shiki 双主题：github-light / github-dark 代码高亮）+ 自定义 Callout 提示框组件。
- **页面与交互**：
  - 首页：Hero 签名区 + 拟真终端状态卡片 + 1 个置顶大卡 + N 个最新文章条目；
  - 文章详情页：右侧悬浮 TOC 目录（基于 Portal 挂载到 body，防动画包含块破坏 fixed 定位）、顶部阅读进度条、上下篇导航、JSON-LD 富媒体结构化数据；
  - 站内搜索：`Cmd/Ctrl+K` 全局快捷键唤起命令面板，构建期压缩生成 `search-index.json`，纯前端加权子串匹配检索；
  - 统一标签页、项目索引页、关于页（Now 时间线、技术栈、联系方式）。

### 2. Next.js 时期踩坑与关键修复记录
1. **Google Fonts 外网阻断**：
   - *问题*：原采用 `next/font/google`，构建期强依赖访问 `fonts.googleapis.com`，网络波动或国内直接报 build 失败。
   - *修复*：替换为 `@fontsource-variable/inter` 和 `@fontsource-variable/jetbrains-mono` 本地自托管字体，构建零网络依赖。
2. **Next 16 静态导出 `PHASE_EXPORT` 永远为 false**：
   - *问题*：Next.js 16 的 `next build` 仅以 `PHASE_PRODUCTION_BUILD` 加载配置，未进入导出分支，导致 `out/` 从未更新。
   - *修复*：在 `next.config.ts` 中同时拦截生产构建与导出 phase，强制输出静态文件。
3. **中文路由 404（Next 16 动态参数未解码）**：
   - *问题*：Next 16 的 params 变为原始 percent-encoded 字符串，导致无法匹配本地中文 slug 文章。
   - *修复*：全站加入 `decodeURIComponent` 统一解码，并在链接处统一 `encodeURIComponent`。
4. **主题系统防首屏闪烁 (FOUC)**：
   - *问题*：水合前如果系统与用户手动保存的偏好不一致，会发生闪烁。
   - *修复*：在 `layout.tsx` 页面最前部注入一段原生同步执行的内联初始化脚本。
5. **文章列表页服务端导出内容为空**：
   - *问题*：原 `post-list.tsx` 使用 `useSearchParams` 导致 Next 静态导出时整块子树被降级为客户端加载占位符。
   - *修复*：改用挂载后从 `window.location.search` 同步状态，首帧直接输出完整 HTML，保证爬虫与无 JS 环境可见。

---

## 三、时期回顾：Astro 5 极致轻量化重构版 (2026.09 - 至今)

> **定位**：彻底抛弃 Next.js 的服务端全量运行时，以 Astro 5 孤岛架构实现真正的纯静态、极速加载与零多余 JS。

### 1. 为什么做这次重构？（架构权衡）
- **性能飞跃**：Next.js 即使纯静态导出，也必须在浏览器中下载并运行 React 整个运行时库（每个页面 ~200KB+ JS）来完成 Hydration 水合；
- **Astro 孤岛优势**：文章正文、排版、列表等 90% 的页面内容被编译为**纯纯的静态 HTML（0 KB JavaScript）**；
- **按需水合**：只有需要交互的部件（搜索面板 `SearchPalette`、阅读进度 `ReadingProgress`、目录高亮 `Toc`、主题切换 `ThemeToggle`）加上 `client:load` / `client:idle` 指令按需注入 React 19，兼顾了丝滑交互与极致加载速度。
- **构建耗时**：从原先 Next.js 的 20~25 秒缩减到 Astro 的 **4~5 秒**。

### 2. 本次上线前的 GitHub Pages 补强（2026-10）
- **自动 Base URL 感知**：在 `astro.config.mjs` 中加入智能解析逻辑，根据 GitHub 注入的 `GITHUB_REPOSITORY` 环境变量自动识别仓库类型：
  - 若为个人根主页仓库（`<username>.github.io`），自动设置 `base: "/"`；
  - 若为项目子仓库（如 `Adhytm/blog`），自动设置 `base: "/blog"`，避免在 GitHub Pages 发生样式与静态资源 404；
- **Jekyll 拦截防护**：在 `public/.nojekyll` 建立防拦截标记，构建后自动写入 `dist/.nojekyll`，防止 GitHub Pages 默认 Jekyll 规则吃掉 `_astro/` 文件夹；
- **全自动化 CI/CD**：创建 `.github/workflows/deploy.yml`，每次 `git push` 自动触发 GitHub 官方容器构建与上线，免除手动打包拷贝。

---

## 四、未来发布博文的标准流程备忘

1. **写新文章**：直接在 `src/content/posts/` 下新建 `文章名字.mdx`；
2. **Frontmatter 格式**：
   ```yaml
   ---
   title: "文章标题"
   date: "2026-10-04"
   description: "文章摘要简介"
   tags: ["标签1", "标签2"]
   draft: false # 设为 true 则不会发布
   weight: 0    # 权重，大于 0 可在首页置顶
   ---
   ```
3. **推送到 GitHub**：
   ```bash
   git add .
   git commit -m "post: 新增文章 <标题>"
   git push
   ```
   GitHub Actions 会在 30 秒内自动编译并推送到你的 GitHub Pages 线上站点。
