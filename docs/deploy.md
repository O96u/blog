# 部署

仓库只生成静态文件。线上根目录是 `/var/www/blog/current`，内容来自 `.output/public`。

部署不会自动发生。GitHub 仓库变量 `DEPLOY_ENABLED` 必须是 `true`，并且配置：

- `SITE_URL`
- secrets：`SSH_HOST`、`SSH_USER`、`SSH_KEY`

服务器准备：

```bash
sudo mkdir -p /var/www/blog/bin /var/www/blog/releases
sudo cp deploy/publish.sh deploy/rollback.sh deploy/healthcheck.sh /var/www/blog/bin/
sudo cp deploy/nginx.conf /etc/nginx/sites-available/blog
sudo cp deploy/redirects.conf /var/www/blog/redirects.conf
sudo nginx -t && sudo systemctl reload nginx
```

`pnpm generate` 会先写 `deploy/redirects.conf`。把它和静态文件一起放上服务器后，Nginx 才能返回旧地址 301。

证书：

```bash
sudo certbot --nginx -d blog.example.com
```

图片上传不在部署流程里。远程模式先在本地执行 `pnpm images:upload`，确认 manifest 里的 `remoteUrl` 已提交，再把 `NUXT_PUBLIC_IMAGE_MODE=remote` 用于对应构建。
