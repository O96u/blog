# Desktop homepage UI refinement (2026-11-13)

本版本直接基于用户上传的 `blog.zip` 源码修改，**仅对首页和共享封面渲染做增量调整**。

## 已实现

- 精选主卡片图片自适应网格高度，消除封面下方的大面积空白。
- 精选副卡片与主卡片使用一致的叠加视觉规则。
- `TextCover` / `PostCover` 增加 `displayMode: 'visual' | 'poster'`，默认保持原 `poster` 行为；首页精选、最新卡片使用 `visual`，避免封面与卡片标题重复。
- `visual` 模式使用 slug 决定性的装饰，不含运行时随机数。
- 首页精选副文章去重，复用统一的 Featured 路径排除规则。
- 最新文章的筛选容器改为 `role=group`，与按钮的 `aria-pressed` 保持语义一致。
- 修复 `main.css` 中 14 处不适用于全局 CSS 的 `:deep()` 选择器。
- 1100px 以上优化 Hero 标题、精选比例、卡片高度与文字层级、首页内容及侧栏间距。

## 保持不变

`/posts/:slug`、Frontmatter、Content 查询方式、草稿规则、图片 local/remote 解析器、SEO、RSS、Twikoo、Umami、CI/CD。

## 本地验收

```bash
pnpm install --frozen-lockfile
pnpm typecheck
pnpm lint
pnpm test
pnpm generate
pnpm seo:audit
pnpm test:e2e
pnpm dev
```

请先在 **1440px 桌面浅色与深色**检查：精选主卡片有无白色空洞、主副卡片尺寸、无图封面不重复标题、最新文章可读性、页面有无横向溢出。

## 环境限制

制作交付包的环境没有可用的 pnpm 11 和项目依赖；无法联网安装，因此未运行完整 Nuxt 构建和 E2E。本包不应被当作已经通过生产验收。
