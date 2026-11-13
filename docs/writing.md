# 写作约定

一篇文章一个文件，文件名就是 slug：`content/posts/my-note.md`。

```md
---
title: 标题
description: 180 字以内的摘要
date: 2026-11-13
draft: true
tags:
  - nuxt
---

正文。
```

- `draft` 省略时视为草稿。确认要公开时再改成 `false`。
- `updated` 不能早于 `date`。
- `pinned` 和 `pinOrder` 只改变文章列表顺序。
- `seo.noindex: true` 的文章可以访问，但不进 sitemap。
- `searchable: false` 不进搜索索引。`comments: false` 不加载评论。
- 图片写成 `![说明](/media/posts/example.webp)`。原图放到 `images-original/posts/`，然后运行 `pnpm images:process`。
- 站内链接使用根路径，例如 `[归档](/archives)`。
- 代码块必须写语言。`ts` 和 `js` 示例要能独立通过语法检查。
- 不要在正文放密钥、草稿哨兵或未发布文章链接。

新建：

```bash
pnpm content:new --slug my-note --title "标题"
```
