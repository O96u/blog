# AGENTS.md

本仓库是 Nuxt 4 静态技术博客。改代码前先看这条。

- 文章只放在 `content/posts/*.md`。默认 `draft: true`。发布必须手写 `draft: false`。
- 文章地址是 `/posts/:slug`。不要新增 `/blog/:slug` 路由。旧地址只走 `data/redirects.json` 的 301。
- 正文图片只写 `/media/posts/...`。原图放 `images-original/posts/`，处理后进 `public/media/posts/`。不要把图床域名写进 Markdown。
- 查询、排序、分页、相关文章和相邻文章走 `shared/blog/model.ts`。置顶只影响列表。
- 生产构建必须排除草稿正文。不要把草稿查询结果写进客户端 payload。
- 图片模式用 `NUXT_PUBLIC_IMAGE_MODE=local|remote`。OSS 密钥不能使用 `NUXT_PUBLIC_` 前缀。
- 普通 CI 不上传图片。`pnpm images:upload` 只在本地、密钥齐全时手动执行。
- 不要部署。部署工作流要等仓库变量 `DEPLOY_ENABLED=true`。
- 改完至少运行：`pnpm content:check`、`pnpm test`、`pnpm generate`、`pnpm seo:audit`。
- 每次开始修改前先读 `docs/AI_HANDOFF.md`，了解 Codex、Cursor 或其他 AI 上一次改了什么、验证到了哪里、还剩什么问题。
- 每次修改结束前必须更新 `docs/AI_HANDOFF.md`：新增一条最新记录，写清本次目标、实际修改、优化原因、验证结果、失败原因和后续 TODO。没有遗留任务也要写“无”。
- 不要覆盖或改写其他 AI 的历史记录；最新记录追加在文件顶部，日期使用 `YYYY-MM-DD HH:mm`（Asia/Shanghai）。
