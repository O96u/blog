# 恢复

发布后健康检查失败时，`deploy/publish.sh` 会把 `current` 指回 `previous`。

手动回滚：

```bash
bash /var/www/blog/bin/rollback.sh https://blog.example.com
```

健康检查要求首页、文章列表、示例文章、归档、标签、关于、RSS、sitemap 返回 200，不存在的文章返回 404，并且首页引用的 CSS 和 JS 返回 200。

本地恢复构建：

```bash
pnpm install --frozen-lockfile
pnpm images:process
pnpm generate
pnpm seo:audit
pnpm preview
```

不要用 `nuxt preview`。静态产物没有 Nitro 服务器，预览脚本直接读取 `.output/public`。
