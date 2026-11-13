# 内容检查

`pnpm content:check` 会失败，如果出现这些情况：

- frontmatter 不符合 schema，或出现未知字段
- `updated` 早于 `date`
- 图片路径离开 `/media/posts/`
- 内部链接指向不存在的公开页面
- 代码块没有允许的语言，或 `ts` / `js` 语法无效
- 已发布文章标题重复，或正文纯文本重复

`reviewAfter` 早于今天只警告，不让检查失败。

合并前还要跑 `pnpm images:verify`、`pnpm test`、`pnpm generate` 和 `pnpm seo:audit`。审计确认草稿哨兵不在 `.output`，sitemap 不含 noindex 和搜索页，公开文章有标题、描述、canonical 和 h1。
