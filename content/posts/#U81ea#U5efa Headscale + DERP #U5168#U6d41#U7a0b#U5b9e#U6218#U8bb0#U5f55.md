---
slug: headscale-derp-self-hosted-guide
title: 自建 Headscale + DERP 全流程实战记录
description: 记录一次完整、可上线、可长期运行的 Headscale + 自建 DERP 搭建过程。 本文不是“能跑就行”的教程，而是 生产可用、已多客户端验证 的配置方案。 简介 Tailscale（Headscale）就是组建一个大的局域网，可以将你
date: 2025-12-25
updated: 2026-01-07
draft: false
pinned: false
tags:
  - headscale
cover: https://s.muxui.com:8015/images/2026/09/RXdzROT8n4vi.webp
toc: true
comments: true
searchable: true
---




> 记录一次完整、可上线、可长期运行的 Headscale + 自建 DERP 搭建过程。  
> 本文不是“能跑就行”的教程，而是**生产可用、已多客户端验证**的配置方案。

## 简介

- Tailscale（Headscale）就是组建一个大的局域网，可以将你手里头的所有设备都拉到这个局域网内，进而使用局域网IP进行互联。
- 此外，Tailscale（Headscale）还有一个作用就是内网穿透，局域网内的设备之间的访问会通过穿透进行打洞（成功概率挺高），进而实现公网的点对点互联。而且就算打洞失败，也可以利用中转服务器进行互联。
- 应用场景举例：家里没有公网IP，但是可以通过Tailscale组网和穿透的方式实现在任意网络下对家里设备的访问。

## 整体架构说明

- 使用 **Headscale** 作为 Tailscale 控制平面
- 自建 **DERP Server**，不依赖官方 DERP
- 使用 **宝塔 / Nginx 统一终止 TLS**
- 开启 **DERP 防白嫖（verify-clients）**
- 多客户端 **tailscale netcheck** 验证通过

### 最终架构如下：

```bash
Tailscale Client
   ↓
Headscale（控制平面）
   ↓ 下发 DERP Map
https://derp.muxui.com/derp.json
   ↓
DERP Server（derper，HTTP 本地端口）
   ↓
宝塔 / Nginx（HTTPS 443）
```

## DERP Server 搭建

### 安装最新版GO

- 更新软件包，安装依赖

```bash
apt update && apt upgrade
apt install -y wget git openssl curl
```

- 下载最新版GO

```bash
wget https://go.dev/dl/go1.25.5.linux-amd64.tar.gz
rm -rf /usr/local/go && tar -C /usr/local -xzf go1.25.5.linux-amd64.tar.gz
```

目前最新版为1.25.5，后续若有更新则可以去 [https://go.dev/dl/](https://go.dev/dl/) 查看最新版并替换下载即可，记得后面的版本号都要改

- 配置环境变量

```bash
export PATH=$PATH:/usr/local/go/bin
go version
```

```bash
echo "export PATH=$PATH:/usr/local/go/bin" >> /etc/profile
source /etc/profile
```

```bash
go env -w GO111MODULE=on
go env -w GOPROXY=https://goproxy.cn,direct
```

### 安装最新版Derper

- 安装

```bash
go install tailscale.com/cmd/derper@latest
```

- 拷贝二进制文件

```bash
mkdir /etc/derp/
cp ~/go/bin/derper /etc/derp/
```

- 查看是否拷贝成功

```bash
ls /etc/derp
```

### derper 域名部署（宝塔反代模式,国内服务器域名需要备案）

⚠️ **关键原则：DERP 不自己处理 TLS**

- TLS 由宝塔 / Nginx 负责
- derper 只监听本地 HTTP

#### 正确启动参数（手动验证用）：

```bash
/etc/derp/derper \
  -a :13445 \
  --hostname derp.muxui.com \
  --certmode=off \
  --stun \
  --stun-port 3478 \
  --verify-clients
```

看到以下日志即为成功：

```bash
STUN server listening on [::]:3478
derper: serving on :13445
```

---

### systemd 服务（最终版）

```ini
[Unit]
Description=Tailscale DERP Server
After=network-online.target
Wants=network-online.target

[Service]
Type=simple
User=root
ExecStart=/etc/derp/derper \
  -a :13445 \
  --hostname derp.muxui.com \
  --certmode=off \
  --stun \
  --stun-port 3478 \
  --verify-clients
Restart=always
RestartSec=5
LimitNOFILE=1048576

[Install]
WantedBy=multi-user.target
```

启用并启动：

```bash
systemctl daemon-reload
systemctl enable derp --now
systemctl status derp
```

### Derper IP部署(123.123.123.123改成自己服务器的IP)

```bash
DERP_IP="123.123.123.123"
```

```bash
openssl req -x509 -newkey rsa:4096 -sha256 -days 3650 -nodes -keyout ${DERP_IP}.key -out ${DERP_IP}.crt -subj "/CN=${DERP_IP}" -addext "subjectAltName=IP:${DERP_IP}"
```

这时候`/root`文件夹下会有两个证书文件：`/root/123.123.123.123.crt`和`/root/123.123.123.123.key`，拷贝到`/etc/derp/`:

```bash
mv /root/123.123.123.123.crt /etc/derp
mv /root/123.123.123.123.key /etc/derp
```

---

### 启动Derper服务器

- 写入后台

新建文件`derp.service`

```bash
touch /etc/systemd/system/derp.service
```

写入以下内容

```ini
[Unit]
Description=TS Derper
After=network.target
Wants=network.target
[Service]
User=root
Restart=always
ExecStart=/etc/derp/derper -hostname 123.123.123.123 -a :13445 -http-port 13446 -certmode manual -certdir /etc/derp
RestartPreventExitStatus=1
[Install]
WantedBy=multi-user.target
```

---

- 启动

```bash
systemctl enable derp
systemctl restart derp
systemctl status derp
```

---

### 验证Derper是否搭建成功

浏览器打开`https://123.123.123.123:13445`，忽略不安全，看看是不是显示下面的内容：

> DERP  
> This is a Tailscale DERP server.
>
> It provides STUN, interactive connectivity establishment, and relaying of end-to-end encrypted traffic for Tailscale clients.
>
> Documentation:
>
> About DERP  
> Protocol & Go docs  
> How to run a DERP server

## DERP 防白嫖（verify-clients）

### 为什么必须开启？

不开启 `--verify-clients`：

- 任何人只要知道你的 DERP 地址
- 都可以把你当 TCP 中继刷流量

### verify-clients 的工作方式

- DERP 通过 **本机的 tailscaled**
- 向 **Headscale** 校验客户端身份
- 只允许本 Tailnet 成员使用

## 搭建Headscale和Headscale-ui

###  安装最新版Headscale


[GitHub：juanfont/headscale](https://github.com/juanfont/headscale)


- 下载

::: code-group labels=[Headscale, Headscale UI]

```bash
wget --output-document=headscale.deb \
  https://github.com/juanfont/headscale/releases/download/v0.27.1/headscale_0.27.1_linux_amd64.deb
```

```bash
wget https://github.com/gurucomputing/headscale-ui/releases/download/2025.08.23/headscale-ui.zip
```

:::

目前最新版为 0.27.1，后续若有更新可前往 [Headscale Releases](https://github.com/juanfont/headscale/releases) 替换下载链接中的版本号；Headscale UI 见 [Headscale UI Releases](https://github.com/gurucomputing/headscale-ui/releases)。

---

- 安装

```bash
mv headscale_0.27.1_linux_amd64.deb headscale.deb
dpkg --install headscale.deb
```

---

- 修改配置文件（`/etc/headscale/config.yaml`）

仅列出需要修改的地方：

```yaml
server_url: https://headscale.muxui.com
listen_addr: 0.0.0.0:8080
metrics_listen_addr: ""
prefixes:
  v4: 100.64.0.0/10
#  v6: fd7a:115c:a1e0::/48
derp:
  urls:
    - https://derp.muxui.com/derp.json
dns:
  base_domain: tailnet.muxui.com
  nameservers:
    global:
      - 114.114.114.114
```

---

- 启动

```bash
systemctl enable headscale
systemctl restart headscale
systemctl status headscale
```

---

### 3.3 安装最新版Headscale-ui


[GitHub：gurucomputing/headscale-ui](https://github.com/gurucomputing/headscale-ui)


- 安装

```bash
apt-get install unzip
unzip -d /var/www headscale-ui.zip
```

### 配置Derper服务器

- 配置`/etc/headscale/derp.json`文件

新建

```bash
touch /etc/headscale/derp.json
```

写入以下内容

ip部署

```json
{
	"Regions": {
		"901": {
			"RegionID":   901,
			"RegionCode": "Myself",
			"RegionName": "Myself Derper",
			"Nodes": [
					{
					"Name":             "901a",
					"RegionID":         901,
					"DERPPort":         13445,
					"IPv4":   "123.123.123.123",
					"InsecureForTests": true
				}
			]
		}
	}
}
```

### 使用域名（推荐做法）

```json
{
  "Regions": {
    "901": {
      "RegionID": 901,
      "RegionCode": "MUXUI",
      "RegionName": "Muxui DERP",
      "Nodes": [
        {
          "Name": "901a",
          "RegionID": 901,
          "HostName": "derp.muxui.com",
          "DERPPort": 443,
          "InsecureForTests": true
        }
      ]
    }
  }
}
```

---

### Nginx / 宝塔暴露 derp.json

```nginx
location /d/derp.json {
    alias /etc/headscale/derp.json;
    default_type application/json;
}
```

验证：

```bash
https://derp.muxui.com/derp.json
```

能直接返回 JSON。

如果不是宝塔,就下载安装并配置Nginx

- 下载

```bash
apt install -y nginx
```

---

- 打开`/etc/nginx/sites-available/default`并添加以下内容：

```nginx
map $http_upgrade $connection_upgrade {
    default      upgrade;
    ''           close;
}
server {
    listen 80;
    listen [::]:80;
    listen 443      ssl http2;
    listen [::]:443 ssl http2;
    server_name headscale.example.com;
    ssl_certificate /root/cert.crt;
    ssl_certificate_key /root/private.key;
    ssl_protocols TLSv1.2 TLSv1.3;
    location / {
        proxy_pass http://127.0.0.1:8080;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection $connection_upgrade;
        proxy_set_header Host $server_name;
        proxy_redirect http:// https://;
        proxy_buffering off;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        add_header Strict-Transport-Security "max-age=15552000; includeSubDomains" always;
    }
    location /web {
		index  index.html;
        	alias  /var/www/web;
	}
}
server {
	listen 80;
	listen [::]:80;

	server_name 127.0.0.1;

	root /var/www;
	index index.html index.htm index.nginx-debian.html;
	location /d {
		alias   /var/www;
		autoindex on;
	}
	location / {
		try_files $uri $uri/ =404;
	}
}
```

---

- 启动

```bash
systemctl enable nginx
systemctl restart nginx
systemctl status nginx
```

### 验证安装

- 重启Derper，Headscale和Nginx服务

```bash
systemctl restart derp
systemctl status derp
```

```bash
systemctl restart headscale
systemctl status headscale
```

```bash
systemctl restart nginx
systemctl status nginx
```

---

- 打开网站

https://headscale.example.com/web

如无意外应该是三个服务的状态应该是全绿的，网页也能正常打开，有报错的话建议按教程自查或在帖子底下留言

### 配置Headscale-ui

- 生成API Key

```bash
headscale apikeys create --expiration 9999d
```

并将其写入到`https://headscale.muxui.com/web/settings.html`的`Headscale API Key`里面，点击`Save API Key`提交，见到右侧有小对勾即可

---

- 新建用户`Default`

打开``https://headscale.`muxui`.com/web/users.html``，点击`New User`，输入`Default`并提交

## 最终验证（最关键）

### Windows 客户端 netcheck

```bash
tailscale netcheck
```

结果示例：

```yaml
Nearest DERP: Muxui DERP
DERP latency:
  - MUXUI: 6.9ms
```

### 下载最新客户端

https://tailscale.com/download

---

### 启动指令解析

> \--login-server: 指定使用的Headscale服务器地址，即`https://headscale.example.com`  
> \--advertise-routes: 向Headscale服务器报告当前客户端处于哪个内网网段下, 便于Headscale服务器让同内网设备直接内网直连(可选的)或者将其他设备指定流量路由到当前内网(可选)，多条路由英文逗号隔开  
> \--accept-routes: 是否接受Headscale服务器下发的用于路由到其他客户端内网的路由规则(可选)  
> \--accept-dns: 是否使用Headscale服务器下发的 DNS 相关配置(可选, 推荐关闭)  
> \--force-reauth：强制重新认证  
> \--advertise-exit-node：作为出口节点

---

### 不同客户端的启动方法

- Windows

以管理员身份启动PowerShell，输入以下代码：

```bash
tailscale login --login-server https://headscale.example.com
```

---

- iOS

用非国区Apple ID下载，配置V P N文件

点击`右上角头像`，点击`Log In...`，点击`右上角三个点`,点击`Use a custom coordination server`，输入`https://headscale.example.com`,点击`Login in`

---

- Linux

安装

```bash
curl -fsSL https://tailscale.com/install.sh | sh
```

运行

```bash
tailscale up --reset --advertise-routes=192.168.x.0/24 --accept-routes=true --login-server=https://headscale.example.com
```

---

### 到Headscale-ui中允许设备加入局域网

上面在客户端执行了`tailscale up`之后，在客户都会显示一个带Device Key的代码，格式类似于：

```bash
headscale nodes register --user USERNAME --key mkey:ed8f19e22f51c9c231c8bc8ccbxxxxxxxxxxxxxxf86c8211e4ad32b6c6e
```

拷贝`mkey:ed8f19e22f51c9c231c8bc8ccbxxxxxxxxxxxxxxf86c8211e4ad32b6c6e`，去 `https://headscale.example.com/web/devices.html`中导入Device Key

##  参考教程

- [Tailscale 搭建derp中继节点，不需要域名，不需要备案，不需要申请证书（最新）](https://www.cnblogs.com/yafengabc/p/18591222)
- [Tailscale实现内网穿透、异地组网、远程访问，纯IP搭建DERP服务器，点对点传输，更好的使用体验！轻松打通内外网！群晖、威联通NAS，替代zerotier#一瓶奶油](https://www.youtube.com/watch?v=gEmmhOdtLbA&t=188s)
- [域名搭建Tailscale开源版本Headscale，配合headscale-ui使用，全方面提升使用体验，实现内网穿透、远程访问，点对点传输，轻松打通内外网！更适合国内的方案](https://www.youtube.com/watch?v=6K0QOo3owkE)
- [自建Headscale后windows登录login无反应的问题解决方法](https://blog.csdn.net/weixin_36114752/article/details/144129664)
- [Tailscale玩法之内网穿透、异地组网、全隧道模式、纯IP的双栈DERP搭建、Headscale协调服务器搭建，用一期搞定，看一看不亏吧？](https://www.youtube.com/watch?v=mgDpJX3oNvI)
- [Tailscale+Headscale+自建Derp踩坑记录](https://linux.do/t/topic/171651)
- [Headscale+Derper的最新教程](https://www.nodeseek.com/post-253641-1)
