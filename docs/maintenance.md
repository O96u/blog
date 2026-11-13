# 维护

- 日常检查：`pnpm content:check`、`pnpm images:verify`。
- 新增原图后运行 `pnpm images:process`。只有图床内容变化时才运行 `pnpm images:upload`。
- 搜索索引和 RSS 由 `pnpm generate` 或 `pnpm dev` 前的 `predev` 重建，不要手改 `public/search-index.json`。
- 评论需要 `NUXT_PUBLIC_TWIKOO_ENV_ID`。统计需要 `NUXT_PUBLIC_UMAMI_SRC` 和 `NUXT_PUBLIC_UMAMI_WEBSITE_ID`。两者都空着时页面不加载对应脚本。
- `reviewAfter` 到期会在内容检查里警告。更新文章后改 `updated`。
- 保留最近 5 个发布目录。更早的由 `deploy/publish.sh` 删除。

## 本地环境配置

复制 `.env.example` 为 `.env`，所有运行时配置都写在本机 `.env`，不要提交 `.env`。

### Umami

```dotenv
NUXT_PUBLIC_UMAMI_SRC=https://你的-umami-域名/script.js
NUXT_PUBLIC_UMAMI_WEBSITE_ID=Umami 后台中的 Website ID
```

两项必须同时填写；任意一项为空时不会加载统计脚本。

### Twikoo

```dotenv
NUXT_PUBLIC_TWIKOO_ENV_ID=https://你的-twikoo-后端地址
NUXT_PUBLIC_TWIKOO_REGION=
NUXT_PUBLIC_TWIKOO_SRC=https://cdn.jsdelivr.net/npm/twikoo@2.0.17/dist/twikoo.min.js
```

- Vercel、Netlify、自建等后端：`ENV_ID` 填完整 HTTPS 地址。
- 腾讯云 CloudBase：`ENV_ID` 填环境 ID；非上海地域再填写 `REGION`。
- 前端版本已固定，升级时需同步确认后端版本兼容性。

### 图片与阿里云 OSS

正文始终只写 `/media/posts/...`，模式通过以下变量切换：

```dotenv
NUXT_PUBLIC_IMAGE_MODE=local
```

- `local`：读取 `public/media/posts/`。
- `remote`：读取图片 manifest 中由上传脚本写入的远程地址。

手动上传 OSS 时，在本机配置：

```dotenv
IMAGE_OSS_ACCESS_KEY_ID=
IMAGE_OSS_ACCESS_KEY_SECRET=
IMAGE_OSS_BUCKET=
IMAGE_OSS_REGION=oss-cn-hangzhou
IMAGE_OSS_PUBLIC_BASE=https://你的图片域名
```

OSS 密钥禁止使用 `NUXT_PUBLIC_` 前缀。原图放入 `images-original/posts/` 后依次执行：

```bash
pnpm images:process
pnpm images:upload
```

普通 CI 和部署流程不会自动上传图片。
