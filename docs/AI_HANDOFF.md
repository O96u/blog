# AI 修改交接与 TODO

本文件是 Codex、Cursor 和其他 AI 之间的唯一修改交接记录。

## 使用规则

1. 开始工作前先读 `AGENTS.md`、`.cursor/rules/blog.mdc` 和本文件。
2. 修改结束前，在“最新记录”下方、旧记录上方追加一条记录，不覆盖历史。
3. 每条记录必须写清：执行者、目标、实际修改、优化原因、验证、失败或阻塞、后续 TODO。
4. TODO 使用任务框：未完成写 `- [ ]`，已完成写 `- [x]`；没有遗留任务也要写 `- [x] 无`。
5. 只记录已经实际完成的修改，不把计划写成完成事项。

## 记录模板

```markdown
### YYYY-MM-DD HH:mm · Codex/Cursor/其他

**目标**
- 本次要解决的问题。

**实际修改与优化**
- `文件路径`：修改内容；这样调整的原因或用户可感知的改进。

**验证**
- [x] 已运行的命令或浏览器检查：结果。

**失败或阻塞**
- 无；或写明错误、影响范围，以及是否为历史问题。

**后续 TODO**
- [ ] 下一位 AI 可继续处理的具体任务。
```

## 最新记录

### 2026-11-13 21:18 · Cursor

**目标**
- 主导航（首页/文章/归档/标签/友链/关于）切换顿挫。

**实际修改与优化**
- `useBlogIndex`：命中 payload/`useNuxtData` 时同步返回，避免每次导航重等索引。
- `plugins/blog-index.client.ts`：客户端预温索引。
- `app.vue` + 各固定页 `keepalive: true`：再次进入缓存页面不重挂。
- `nuxt.config` 关闭 page/layout 过渡；`router.options.ts` 滚顶用 `auto`。
- `SiteHeader` 导航 `prefetch` + `viewport`。

**验证**
- [x] `pnpm exec nuxi typecheck`：通过。

**失败或阻塞**
- 无。

**后续 TODO**
- [x] 无。

### 2026-11-13 21:10 · Cursor

**目标**
- 本地文章列表分页仍顿挫：查因并提升丝滑度。

**实际修改与优化**
- `PostListPage.vue`：去掉 `Transition` out-in（会先淡出再淡入）；`currentPage` 乐观更新 + `router.replace` 同步 URL；分页 `click` 优先本地换页；滚动仅在离开视区时瞬时回顶。
- `posts/page/[page].vue`：客户端 `replace` 到 `/posts?page=N`，与列表分页同路由。
- `posts/index.vue`：`definePageMeta({ key: 'posts-archive' })` 稳定页面实例。

**验证**
- [x] `pnpm exec nuxi typecheck`：通过。
- [x] `/posts` 200。

**失败或阻塞**
- 无。

**后续 TODO**
- [x] 无。

### 2026-11-13 21:02 · Cursor

**目标**
- 修复 `/posts` 500（Vue 模板 `v-else` 编译错误）。

**实际修改与优化**
- `app/components/PostListPage.vue`：空状态 `v-else` 移入 `<Transition>` 内，与列表 `v-if` 成对。

**验证**
- [x] `curl http://localhost:3000/posts`：200。

**失败或阻塞**
- 无。

**后续 TODO**
- [x] 无。

### 2026-11-13 20:55 · Cursor

**目标**
- 说明文章分页机制，减轻点击分页时的顿挫感。

**实际修改与优化**
- 分页点击改为留在 `/posts` 上用 `?page=N` 切换（`postsListRouteLocation`），避免 `/posts` ↔ `/posts/page/N` 整页路由卸载；`/posts/page/N` 仍保留给静态预渲染与外链。
- `PostListPage.vue`：列表 `Transition` 淡入、翻页后平滑滚到网格顶；当前页码用 `span` 避免无意义导航。
- `useBlogIndex`：`getCachedData` 复用索引，减少重挂时等待。
- `nuxt.config.ts` 预渲染页数按 `PAGE_SIZE` 计算。

**验证**
- [x] `pnpm exec vitest run tests/model.test.ts`：通过。
- [x] `pnpm exec nuxi typecheck`：通过。

**失败或阻塞**
- 无。

**后续 TODO**
- [x] 无。

### 2026-11-13 20:48 · Cursor

**目标**
- 文章列表每页 12 篇，分页条居中并带上下页箭头。

**实际修改与优化**
- `shared/blog/model.ts`：`PAGE_SIZE` 10 → 12（列表、预渲染页数、SEO 审计共用）。
- `app/components/PostListPage.vue`：分页改用 `posts-archive-pagination`，左右 chevron + 页码。
- `app/assets/css/main.css`：居中、当前页浅灰圆底、无描边页码样式（参考 muxui）。

**验证**
- [x] `pnpm exec vitest run tests/model.test.ts`：通过。
- [x] `pnpm exec nuxi typecheck`：通过。

**失败或阻塞**
- 无。

**后续 TODO**
- [x] 无。

### 2026-11-13 20:42 · Cursor

**目标**
- 友链卡片不再展示 `Blog` / `Tools` 等分类标签。

**实际修改与优化**
- `shared/blog/friend-links.ts`：从 `friendsConfig` / `FriendLink` 移除 `tags` 字段。
- `app/components/friends/FriendLinkCard.vue`：去掉标题旁标签徽章。
- `app/assets/css/main.css`：删除 `.friends-card-tag`、`.friends-card-head` 相关样式。

**验证**
- [x] `pnpm exec nuxi typecheck`：通过。

**失败或阻塞**
- 无。

**后续 TODO**
- [x] 无。

### 2026-11-13 20:35 · Cursor

**目标**
- 友链页统计文案与参考站一致；去掉友链卡片右下角外链箭头。

**实际修改与优化**
- `app/pages/friends.vue`：页头统计改为「共 N 个站点 | N 个在线」，在线数随探测状态更新；移除「进入页面自动检测可达性」文案。
- `app/assets/css/main.css`：新增 `friends-page-stat` 样式（分隔符、在线数 teal）；删除 `.friends-card-open`；卡片正文不再为箭头预留右侧留白。
- `app/components/friends/FriendLinkCard.vue`：移除 `arrow-up-right` 图标。

**验证**
- [x] `pnpm exec nuxi typecheck`：通过。

**失败或阻塞**
- 无。

**后续 TODO**
- [x] 无。

### 2026-11-13 19:51 · Codex

**目标**
- 修复站内搜索首次输入无结果、按 Enter 不跳转，以及搜索弹窗反馈不足的问题。

**实际修改与优化**
- `app/components/SearchPanel.vue`：使用共享 Promise 等待搜索索引加载，修复用户在索引加载期间输入后不会重新搜索的竞态；校验索引结构，失败后允许重试。
- `app/components/SearchPanel.vue`：按 Enter 打开当前高亮结果，支持上下方向键循环选择；弹窗打开后可靠聚焦输入框，并补充无结果、加载失败和快捷键提示。
- `app/components/SearchDialog.vue`、`app/assets/css/main.css`：重做搜索弹窗、输入框、结果列表、活动结果和关闭按钮样式。

**验证**
- [x] `pnpm exec vue-tsc --noEmit`：通过。
- [x] `pnpm exec vitest run tests/search.test.ts`：3/3 通过。
- [x] 浏览器搜索 `Headscale`：返回“自建 Headscale + DERP 全流程实战记录”。
- [x] 浏览器按 Enter：成功跳转 `/posts/headscale-derp-self-hosted-guide`，文章正文正常显示。

**失败或阻塞**
- 完整生产生成仍受历史外链图片迁移问题阻塞，与搜索改动无关。

**后续 TODO**
- [x] 无搜索相关遗留任务。

### 2026-11-13 19:36 · Codex

**目标**
- 提升文章页整体视觉质感，补充回到顶部、阅读进度和清晰的代码行号。

**实际修改与优化**
- `app/pages/posts/[slug].vue`：文章头部改为更克制的杂志式标题区，增加分类上下文，目录标题中文化为“文章目录”。
- `app/components/ArticleBackToTop.vue`：新增阅读进度条和滚动 560px 后出现的回到顶部按钮，支持平滑滚动与无障碍标签。
- `app/components/content/ProsePre.vue`：重构代码块工具栏类名，语言标签与复制按钮具备独立视觉层级。
- `app/assets/css/main.css`：优化标题区、正文节奏、标题锚点、代码块、行号分栏、复制按钮、阅读进度和回到顶部动画；标题旁 `#` 改为桌面端悬停显示。

**验证**
- [x] `pnpm exec vue-tsc --noEmit`：通过。
- [x] 相关 Vitest：11/11 通过。
- [x] 浏览器检查：代码行号伪元素显示为 `1`，宽度 51.2px，代码工具栏已生效。
- [x] 浏览器滚动检查：回到顶部按钮出现，阅读进度更新，目录标题显示“文章目录”。

**失败或阻塞**
- 完整生产生成仍受上一条记录中的历史外链图片迁移问题阻塞，本次没有新增构建错误。

**后续 TODO**
- [ ] 迁移存量文章外链图片后，补跑完整 `pnpm generate` 与 `pnpm seo:audit`。

### 2026-11-13 19:27 · Codex

**目标**
- 修复 WordPress/Astro 等迁移文章中代码块吞掉后续正文、标题和列表的问题，并防止后续迁移再次产生同类错误。

**实际修改与优化**
- `content/posts/*.md`：批量检查全部文章代码围栏，修复 12 篇迁移文章中错误写成 ` ```bash`、` ```text`、` ```yaml` 等形式的结束围栏；结束行统一为纯 ` ``` `，正文和代码块恢复分离。
- `shared/blog/format-imported-post.ts`：新增迁移围栏修复逻辑，并移除会把结束围栏再次误判成开始围栏的重复裸围栏正则。
- `scripts/content-check.ts`：新增未闭合代码块、结束围栏携带语言标记的校验，后续导入异常会直接报出文章和行号。
- `tests/format-imported-post.test.ts`：新增多代码块迁移回归测试。

**验证**
- [x] 全部 `content/posts/*.md` 围栏扫描：没有错误结束围栏或未闭合围栏。
- [x] `pnpm exec vitest run tests/format-imported-post.test.ts`：3/3 通过。
- [x] `pnpm exec vue-tsc --noEmit`：通过。
- [x] `pnpm test`：与本次修改相关的 26 项测试全部通过；仅生成产物测试因 `.output/public` 不存在而无法加载。
- [x] 浏览器检查 Headscale 文章：架构代码块、后续二三级标题、列表及多个独立代码块均正常展示。
- [x] 浏览器检查 WordPress 迁移文章：代码块后续章节与目录恢复显示。

**失败或阻塞**
- `pnpm content:check` 已不再报告代码围栏问题，但仍被存量文章外链图片规则阻止；这是上一条记录中的既有迁移任务。
- `pnpm generate` 通过了内容解析和前后端编译，随后在图片完整性校验处因上述历史外链图片失败；`pnpm seo:audit` 因没有生成 `.output/public` 无法执行。

**后续 TODO**
- [ ] 继续迁移存量文章的外链图片到 `/media/posts/...`，完成后重跑完整内容检查和生产生成。

### 2026-11-13 19:20 · Codex

**目标**
- 统一首页文章封面与整体 UI；首页改为“加载更多”，完整文章列表和分页保留在 `/posts`。
- 保留适量的右栏文章聚合和站点统计，站点名称统一为 Muxui。
- 修复文章页正文层级、固定目录、相关文章卡片和 Twikoo 评论区域。
- 建立 Codex 与 Cursor 共用的修改交接机制，并补齐环境变量中文注释。

**实际修改与优化**
- 首页文章卡片统一封面比例、密度和信息层级；首页使用加载更多，避免展示完整分页。
- 首页右栏保留文章聚合与站点统计，控制模块数量，避免视觉突兀。
- 文章页正文只保留文章标题为 `h1`；Markdown 一级标题统一渲染为 `h2`，并补充 `h1` 到 `h6` 的视觉层级。
- 文章目录改为吸顶，并根据滚动位置高亮当前章节、设置 `aria-current="location"`。
- 缩小相关文章卡片，补充并固定 Twikoo 2.0.17 前端加载配置。
- `.env.example`：为站点地址、图片模式、Twikoo、Umami 和 OSS 变量补充中文注释。
- `AGENTS.md`、`.cursor/rules/blog.mdc`：要求所有 AI 修改前读取、修改后更新本交接文件。

**验证**
- [x] `pnpm exec vue-tsc --noEmit`：通过。
- [x] 相关 Vitest：8/8 通过。
- [x] 浏览器滚动检查：目录固定在顶部，当前章节会随滚动高亮。
- [x] 开发服务已恢复。

**失败或阻塞**
- `pnpm content:check` 和 `pnpm generate` 仍被存量文章中的外链图片阻止；旧正文包含 `https://s.muxui.com:8015/...` 等地址，尚未迁移为 `/media/posts/...`。
- `pnpm seo:audit` 依赖成功生成的 `.output/public`，因此随生产构建失败而无法完成。

**后续 TODO**
- [ ] 分批迁移存量文章外链图片到 `images-original/posts/` 和 `/media/posts/...`，然后重新运行 `pnpm content:check`、`pnpm generate`、`pnpm seo:audit`。
- [ ] 实际部署 Twikoo 后端后，在本地 `.env` 或部署平台环境变量填写 `NUXT_PUBLIC_TWIKOO_ENV_ID`，做一次真实评论提交测试。
- [ ] 创建 Umami Website 后填写 `NUXT_PUBLIC_UMAMI_SRC` 和 `NUXT_PUBLIC_UMAMI_WEBSITE_ID`，在浏览器网络面板确认统计请求。
