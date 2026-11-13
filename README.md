# Ou Blog

Nuxt 4 静态技术博客。文章、搜索、RSS 和页面都在 `pnpm generate` 时生成，服务器只托管 `.output/public`。

## 命令

```bash
pnpm install
pnpm dev
pnpm lint
pnpm typecheck
pnpm test
pnpm content:check
pnpm images:process
pnpm images:verify
pnpm generate
pnpm seo:audit
pnpm preview
pnpm test:e2e
```

`pnpm preview` 读取静态目录。`nuxt preview` 需要 Node 服务器产物，不能用来看这次生成结果。

新文章：

```bash
pnpm content:new --slug my-note --title "标题"
```

图片默认 `NUXT_PUBLIC_IMAGE_MODE=local`。图床上传使用 `pnpm images:upload`，密钥放在本机环境变量，不进客户端。

## 地址

`/`、`/posts`、`/posts/:slug`、`/archives`、`/tags`、`/tags/:slug`、`/search`、`/about`、`/rss.xml`、`/sitemap.xml`。

写作、检查、部署和恢复说明在 `docs/`。
