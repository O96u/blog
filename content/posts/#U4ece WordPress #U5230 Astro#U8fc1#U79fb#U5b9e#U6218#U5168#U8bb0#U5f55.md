---
slug: wordpress-to-astro-migration
title: 从 WordPress 到 Astro迁移实战全记录
description: 记录将 Muxui 从 WordPress（B2 Pro）完整迁移到 Astro 静态博客主题 Firefly 的全过程：导出 WXR、HTML 转 Markdown、图床改写、友链与导航定制、Twikoo 评论迁移，以及迁移中踩过的坑。
date: 2026-07-23
updated: 2026-07-23
draft: false
pinned: false
tags:
  - wordpress
  - astro
  - firefly
toc: true
comments: true
searchable: true
---




这篇文章记录了把 [Muxui](https://muxui.com) 从 **WordPress（B2 Pro）** 迁到 **Astro + Firefly** 的完整过程。不是「理论科普」，而是一次可复现的实操：文章怎么导、图片怎么改、评论怎么接到 Twikoo、导航怎么拆、友链怎么迁、踩了哪些坑。

如果你也在考虑离开 WordPress，或者正在把内容搬到 Astro / Fuwari / Firefly 一类静态主题，可以直接对照本文的步骤做。

---

## 为什么离开 WordPress

WordPress 很强，但对我这种以内容为主、不需要商城和复杂会员体系的个人站来说，日常成本越来越明显：

- **性能与安全**：PHP + 数据库 + 插件栈，更新、备份、防篡改都要花精力
- **主题耦合深**：B2 Pro 功能丰富，但短代码、付费隐藏、圈子等和主题绑死，换主题等于重做
- **静态化红利**：Astro 构建后是纯静态（或边缘静态），CDN 分发简单，运维接近零

最终选择 **Firefly**——基于 Astro 的个人博客主题，Markdown / MDX 写作，配置全在 TypeScript 文件里，改起来清晰。

---

## 目标架构一览

| 项目   | 迁移前                             | 迁移后                    |
| ------ | ---------------------------------- | ------------------------- |
| 运行时 | WordPress + PHP + MySQL            | Astro 静态构建            |
| 主题   | B2 Pro                             | Firefly（fork 自用）      |
| 内容   | 后台编辑器 / Gutenberg             | `src/content/posts/*.md`  |
| 图片   | `muxui.com/wp-content/uploads/...` | `muxui.com/uploads/...`   |
| 评论   | WordPress 数据库 / 主题评论        | Twikoo（独立服务 + 导入） |
| 域名   | muxui.com                          | 仍为 muxui.com            |

仓库结构大致是：

```bash
Firefly/
├── muxui.WordPress.2026-07-23.xml   # WXR 导出（本地用，不必提交）
├── scripts/
│   ├── migrate-wordpress.mjs        # 一次性迁移脚本
│   └── lib/
│       ├── wxr-parse.mjs            # 解析 WXR
│       └── html-to-md.mjs           # HTML → Markdown + 图床改写
├── src/config/                      # 站点 / 导航 / 友链等配置
└── src/content/posts/               # 迁过来的文章
```

```python
import fs from "node:fs";
import path from "node:path";
import { parseWxr } from "./lib/wxr-parse.mjs";
import { htmlToMarkdown, rewriteImageUrls } from "./lib/html-to-md.mjs";

const ROOT = process.cwd();
const XML = path.join(ROOT, "muxui.WordPress.2026-07-23.xml");
const POSTS_DIR = path.join(ROOT, "src/content/posts");
const SITE_CONFIG = path.join(ROOT, "src/config/siteConfig.ts");

function decodeSlug(raw) {
  if (!raw) return "";
  try {
    return decodeURIComponent(raw);
  } catch {
    return raw;
  }
}

function safeSlug(title, id) {
  const base = title
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
  return base || `post-${id}`;
}

function pickCategory(cats) {
  const specific = cats.filter((c) => c !== "文章");
  return specific[0] || cats[0] || "";
}

function yamlEscape(s) {
  return String(s).replace(/\\/g, "\\\\").replace(/"/g, '\\"');
}

function toIsoDate(wpDate) {
  return wpDate.slice(0, 10);
}

function excerptFrom(md, excerpt) {
  if (excerpt?.trim()) return excerpt.trim().slice(0, 160);
  const plain = md
    .replace(/!\[[^\]]*\]\([^)]*\)/g, "")
    .replace(/\[[^\]]*\]\([^)]*\)/g, "$1")
    .replace(/[#>*`\[\]()\-_!]/g, " ")
    .replace(/https?:\/\/\S+/g, "")
    .replace(/\s+/g, " ")
    .trim();
  return plain.slice(0, 120);
}

function clearPostsDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    return;
  }
  for (const name of fs.readdirSync(dir)) {
    fs.rmSync(path.join(dir, name), { recursive: true, force: true });
  }
}

function buildFrontmatter(post, image, body, slug) {
  const tags = post.tags.map((t) => `"${yamlEscape(t)}"`).join(", ");
  const desc = excerptFrom(body, post.excerpt);
  return `---
title: "${yamlEscape(post.title)}"
published: ${toIsoDate(post.date)}
updated: ${toIsoDate(post.modified)}
description: "${yamlEscape(desc)}"
image: "${yamlEscape(image)}"
tags: [${tags}]
category: "${yamlEscape(pickCategory(post.cats))}"
draft: false
comment: true
slug: "${yamlEscape(slug)}"
---

`;
}

function patchSiteConfig(filePath) {
  let src = fs.readFileSync(filePath, "utf8");
  src = src.replace(/title: "Firefly"/, 'title: "Muxui"');
  src = src.replace(/subtitle: "Demo site"/, 'subtitle: "记录美好生活！"');
  src = src.replace(
    /site_url: "https:\/\/firefly\.cuteleaf\.cn"/,
    'site_url: "https://muxui.com"',
  );
  src = src.replace(
    /description:\s*\n\s*"[\s\S]*?",/,
    'description:\n\t\t"记录美好生活！",',
  );
  src = src.replace(
    /keywords: \[[\s\S]*?\],/,
    `keywords: [
\t\t"Muxui",
\t\t"博客",
\t\t"技术博客",
\t\t"muxui.com",
\t],`,
  );
  src = src.replace(/(navbar: \{[\s\S]*?title: )"Firefly"/, '$1"Muxui"');
  fs.writeFileSync(filePath, src);
}

function main() {
  if (!fs.existsSync(XML)) {
    console.error("Missing WXR:", XML);
    process.exit(1);
  }

  const { posts, attachmentsById } = parseWxr(XML);
  console.log(`Parsed ${posts.length} published posts`);

  clearPostsDir(POSTS_DIR);

  const used = new Set();
  for (const post of posts) {
    const body = htmlToMarkdown(post.content);
    let image = "";
    if (post.thumbnailId && attachmentsById.has(post.thumbnailId)) {
      image = rewriteImageUrls(attachmentsById.get(post.thumbnailId));
    }
    let slug = decodeSlug(post.slug) || safeSlug(post.title, post.id);
    // Windows-safe filenames: avoid reserved chars
    slug = slug.replace(/[<>:"/\\|?*]/g, "-").replace(/\.+$/g, "");
    if (used.has(slug)) slug = `${slug}-${post.id}`;
    used.add(slug);
    const fm = buildFrontmatter(post, image, body, slug);
    const out = path.join(POSTS_DIR, `${slug}.md`);
    fs.writeFileSync(out, fm + body + "\n", "utf8");
    console.log("Wrote", path.relative(ROOT, out));
  }

  patchSiteConfig(SITE_CONFIG);
  console.log("Patched", path.relative(ROOT, SITE_CONFIG));
  console.log("Done.");
}

main();
```

```python
import fs from "node:fs";
import { XMLParser } from "fast-xml-parser";

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: "@_",
  cdataPropName: "__cdata",
  isArray: (name) =>
    ["item", "category", "wp:postmeta", "wp:comment"].includes(name),
});

function textOf(node) {
  if (node == null) return "";
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (typeof node === "object" && "__cdata" in node)
    return String(node.__cdata ?? "");
  return String(node);
}

function metaMap(postmeta) {
  const map = {};
  for (const m of postmeta || []) {
    map[textOf(m["wp:meta_key"])] = textOf(m["wp:meta_value"]);
  }
  return map;
}

function categoriesOf(item) {
  const cats = [];
  const tags = [];
  for (const c of item.category || []) {
    const name = textOf(c);
    const domain = c["@_domain"];
    if (domain === "post_tag") tags.push(name);
    else if (domain === "category") cats.push(name);
  }
  return { cats, tags };
}

export function parseWxr(xmlPath) {
  const xml = fs.readFileSync(xmlPath, "utf8");
  const doc = parser.parse(xml);
  const channel = doc.rss.channel;
  const attachmentsById = new Map();
  const posts = [];

  for (const item of channel.item || []) {
    const type = textOf(item["wp:post_type"]);
    const id = textOf(item["wp:post_id"]);
    if (type === "attachment") {
      const url = textOf(item["wp:attachment_url"]) || textOf(item.guid) || "";
      attachmentsById.set(id, url);
      continue;
    }
    if (type !== "post") continue;
    if (textOf(item["wp:status"]) !== "publish") continue;

    const { cats, tags } = categoriesOf(item);
    const meta = metaMap(item["wp:postmeta"]);
    posts.push({
      id,
      title: textOf(item.title),
      slug: textOf(item["wp:post_name"]),
      date: textOf(item["wp:post_date"]),
      modified: textOf(item["wp:post_modified"]),
      excerpt: textOf(item["excerpt:encoded"]),
      content: textOf(item["content:encoded"]),
      cats,
      tags,
      thumbnailId: meta._thumbnail_id || "",
    });
  }

  return {
    site: {
      title: textOf(channel.title),
      link: textOf(channel.link),
      description: textOf(channel.description),
    },
    attachmentsById,
    posts,
  };
}
```

```python
import TurndownService from "turndown";

const TARGET_PREFIX = "https://muxui.com/uploads/";

export function rewriteImageUrls(text) {
  return text
    .replace(/https?:\/\/img\.roven\.cc\/images\//g, TARGET_PREFIX)
    .replace(/https?:\/\/muxui\.com\/wp-content\/uploads\//g, TARGET_PREFIX)
    .replace(/(["'(=\s]|^)\/wp-content\/uploads\//g, `$1${TARGET_PREFIX}`);
}

function stripShortcodes(html) {
  return html
    .replace(/\[\/?b2[^\]]*\]/gi, "")
    .replace(/\[hide[^\]]*\]([\s\S]*?)\[\/hide\]/gi, "$1")
    .replace(/\[.*?\]/g, (m) => {
      const href = m.match(/https?:\/\/[^\s\]]+/);
      return href ? `<p><a href="${href[0]}">${href[0]}</a></p>` : "";
    });
}

export function htmlToMarkdown(html) {
  const cleaned = stripShortcodes(rewriteImageUrls(html));
  const td = new TurndownService({
    headingStyle: "atx",
    codeBlockStyle: "fenced",
    bulletListMarker: "-",
  });
  td.keep(["iframe", "video", "table"]);
  return td.turndown(cleaned).trim();
}
```

---

## 第一步：从 WordPress 导出内容

后台路径：**工具 → 导出 → 全部内容**，得到 WXR（WordPress eXtended RSS）XML。

我这份导出里大致有：

- 已发布文章 **23** 篇（另有 1 篇草稿跳过）
- 附件约 **181** 个（主要用于封面 ID → URL 映射）
- 以及页面、友链、圈子、快讯等 B2 扩展类型

第一期只迁 **已发布文章 + 站点基础信息**；友链、页脚备案、导航定制是迁完内容后再单独处理的。

> 建议：导出后先把 XML 放到仓库根目录本地用，**不要轻易提交到公开仓库**（体积大，也可能含邮件等隐私字段）。

---

## 第二步：写一个可复跑的迁移脚本

手工复制 23 篇不现实，所以用 Node 脚本一次性完成：

1. 用 `fast-xml-parser` 解析 WXR
2. 建立 `attachment_id → URL` 索引（封面 `_thumbnail_id`）
3. 过滤 `post_type=post` 且 `status=publish`
4. Gutenberg HTML → Markdown（`turndown`）
5. 改写图片域名
6. 写出 Firefly frontmatter + `.md` 文件
7. 更新 `siteConfig.ts`，删掉主题自带 Demo 文

核心映射关系：

| WordPress                    | Firefly                                        |
| ---------------------------- | ---------------------------------------------- |
| title                        | `title`                                        |
| post_name（URL 解码）        | 文件名 / `slug`                                |
| post_date                    | `published`                                    |
| post_modified                | `updated`                                      |
| category                     | `category`（优先具体分类，弱化泛化的「文章」） |
| post_tag                     | `tags`                                         |
| excerpt / 正文截取           | `description`                                  |
| `_thumbnail_id` → attachment | `image`（绝对 URL）                            |
| content:encoded              | Markdown 正文                                  |

图片统一规则：

```bash
https://muxui.com/wp-content/uploads/{path}
  → https://muxui.com/uploads/{path}
```

相对路径 `/wp-content/uploads/...` 同样改写；**外站**自带的 `/wp-content/uploads/`（例如引用别人站点的图）不要动，否则会出现：

```bash
https://www.example.comhttps://muxui.com/uploads/...
```

这种拼接错乱——我第一次写正则时就踩过。

运行方式：

```bash
pnpm add -D turndown fast-xml-parser
node scripts/migrate-wordpress.mjs
pnpm check
```

---

## 第三步：处理 B2 / Gutenberg 的「脏内容」

纯 Markdown 博客迁出去通常很干净；B2 + Gutenberg 会带上：

- 区块注释：`<!-- wp:paragraph -->`
- 短代码：隐藏内容、下载框、卡片等
- 偶发残缺 HTML、外链图片

策略是 **可读优先，不追求像素级还原**：

- Turndown 处理常见标题、列表、链接、代码块、表格
- `[hide]...[/hide]` 之类尽量展开正文
- 无法可靠还原的短代码，降级成链接或直接丢掉，保证构建不炸

迁完后务必抽查：

- 图多的文章（封面 + 正文图是否都是 `muxui.com/uploads`）
- 代码长文（Markdown 代码围栏是否完整）
- 带外链配图的文章（外站 URL 是否被误伤）

---

## 第四步：站点身份与页脚

`siteConfig.ts` 里至少改这些：

- `title` / `navbar.title` → Muxui
- `subtitle` / `description` → 「记录美好生活！」
- `site_url` → `https://muxui.com`

页脚版权与备案：

```bash
Copyright © 2026 Muxui ・ 蜀ICP备2024080231号-1
```

备案号放在 `FooterConfig.html`，并链到工信部查询页 `https://beian.miit.gov.cn/`。侧栏显示名同步改成 Muxui。

---

## 第五步：导航按「文章 / 软件」分组

WordPress 时代分类较杂。迁到 Firefly 后，导航做成：

**主要 · 文章 · 软件 · 工具 · 友链 · 留言 · 关于我**

其中：

- **文章** 下拉：归档 / 分类 / 标签 —— 只覆盖  
  `文章、Java、Python、PHP、Vue、jQuery`
- **软件** 下拉：归档 / 分类 / 标签 —— 只覆盖  
  `软件、Windows、Mac、IOS`
- **工具**：外链 `https://muxui.com/tools`，新窗口打开

实现上用配置文件声明分组，例如：

```ts
export const CONTENT_GROUPS = {
  article: {
    id: "article",
    name: "文章",
    categories: ["文章", "Java", "Python", "PHP", "Vue", "jQuery"],
  },
  software: {
    id: "software",
    name: "软件",
    categories: ["软件", "Windows", "Mac", "IOS"],
  },
};
```

- 归档：`/archive/?category=A&category=B&...`（Firefly 的 ArchivePanel 支持多 `category` OR 筛选）
- 分类页：`/categories/article/`、`/categories/software/`
- 标签页：`/tags/article/`、`/tags/software/`（标签点击时带上同组 category，避免串到另一边）

相册、追番、番组、打赏、音乐等与个人站无关的入口全部关掉，避免空页面。

---

## 第六步：友链迁移与入驻说明

WordPress 里 `post_type=links` 很多，真正「友情链接」分类只有几条；AI / 网络工具那些不算友链，不要混进 Firefly 的 `friendsConfig`。

最终保留例如：

- 朱某的生活印记
- 小栋博客
- handsome

并在 `src/content/spec/friends.mdx` 写清：

**本站信息**

- 名称：Muxui
- 介绍：记录个人生活点滴与技术笔记……
- 地址：`https://muxui.com`
- Logo：`https://muxui.com/favicon.ico`

**入驻说明要点**

1. 必须完成国内 ICP 备案
2. 欢迎个人博客、WordPress 类同类站互换
3. 首页链接需双方同等待遇
4. 提交后请联系博主；未通过会在留言板回应
5. 内容须合法合规
6. 定期检查死链；对方取消互链则删除且不另行通知
7. 请先在贵站加好本站，再按模板申请

---

## 第七步：评论迁移（Twikoo）

文章迁到 Markdown **不会**带走 WordPress 评论。评论在 MySQL 里（或通过 WXR 里的 `wp:comment` 节点导出），需要**单独**接到静态站用的评论服务上。

Muxui 选用 **[Twikoo](https://twikoo.js.org/)**：后端自建（Docker），前端在 Firefly 里通过 `commentConfig.ts` 加载；评论数据与 Astro 构建产物无关，换主题、重新部署静态站都不会冲掉评论库。

### 7.1 先搞清楚「评论挂在哪」

Firefly 给 Twikoo 传的 **`path`** 规则是（见 `src/components/comment/index.astro`）：

- 普通文章：`/posts/{文件名去掉.md}`，例如 `src/content/posts/hello-world.md` → `/posts/hello-world`
- 留言板等特殊页：用 `customPath`（如 `/guestbook/`）

Twikoo 按这个 **path（或与之对应的完整 URL）** 把评论和页面绑在一起。  
因此导入历史评论时，每条记录的 **`url` / 页面标识** 必须和**现在线上文章地址一致**。若你后来改过 Markdown 文件名（标题重命名），旧 WordPress 链接 `https://muxui.com/某旧slug/` 和新站 `/posts/某新文件名/` 对不上，评论会「挂在旧地址上」，页面上就看不到——需要在导入 JSON 里做 **slug 映射**，或导入后再在 Twikoo 后台/database 里批量改 `url`（后者更折腾，建议导入前改好）。

WordPress 常见 permalink 是 `/%postname%/`；迁到 Firefly 后多是 `/posts/{slug}/`。**permalink 结构变了，评论迁移的核心就是 path 映射表。**

### 7.2 静态站侧要做的配置

1. 部署 Twikoo 服务（官方 Docker 即可；可用 **LokiJS 本地库**，不必强上 MongoDB，个人站够用）。
2. `src/config/commentConfig.ts`：

```ts
export const commentConfig: CommentConfig = {
  type: "twikoo",
  twikoo: {
    envId: "https://你的-twikoo-域名或IP:端口",
    lang: "zh-CN",
    visitorCount: true,
    jsUrl:
      "https://registry.npmmirror.com/twikoo/1.7.14/files/dist/twikoo.min.js",
    cssUrl: "/assets/css/twikoo-custom.css",
  },
};
```

3. 文章 frontmatter 里 `comment: true`（迁移脚本里已默认写上）才会显示评论区。
4. 本站使用 **Swup** 无刷新切换时，需保证 Twikoo 在换页后按**当前文章 path** 重新 `init`（Firefly 已在 `Twikoo.astro` 里用 `data-twikoo-path` 处理；若自改主题，注意不要沿用上一篇的 path）。

### 7.3 从 WordPress 导出评论数据

WXR 里每个 `<item>`（文章）下可带多条 `wp:comment`，字段大致包括：

- 评论内容、`wp:comment_author`、`wp:comment_author_email`、`wp:comment_author_url`
- `wp:comment_date`、`wp:comment_parent`（楼中楼）
- 所属文章由该 `<item>` 的 `wp:post_id` / `wp:post_name` 决定

**做法**：在解析 WXR 时除了正文，再扫一遍 `wp:comment`，按 `post_name`（或你映射后的新 slug）分组，转成 Twikoo 可导入的 JSON。  
（与正文迁移一样，这一步适合写一次性 Node 脚本；不必进 Git，本地跑完即可。）

Twikoo 侧常见导入方式：

| 方式                            | 说明                                                                                                         |
| ------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| 后台「导入」                    | 若你**以前就用 Twikoo / Valine / Waline** 等，可直接按官方文档选对应格式导入                                 |
| **自写 JSON + 导入接口 / 后台** | 从 WordPress 转出来的数据，一般要按 Twikoo 文档的字段整理；Muxui 走的是「WXR → 转换 → Twikoo JSON → 再导入」 |
| 放弃历史评论                    | 只保留新评论，最省事                                                                                         |

没有「官方一键 WordPress → Twikoo」按钮；**不能完美自动**时，接受只迁近 N 条或只迁留言板，也合理。

### 7.4 导入时要注意的坑（实测）

下面这些是我迁 Muxui 时踩过的，和「能不能在页面上看到评论」直接相关：

1. **`url` / path 必须与线上一致**  
   少写 `/posts` 前缀、多了尾部斜杠不一致、或仍用 WordPress 旧 slug，都会导致评论列表为空。

2. **楼中楼字段 `rid`（回复目标 id）**  
   使用 LokiJS 存储时，若子评论的 `rid` 留成非法空串，可能导致接口报错、整页评论拉不出来。导入时要嘛按父子关系填对目标评论 id，要嘛先把历史评论压平成一层（无回复），再慢慢补。

3. **Twikoo 版本与 `jsUrl` 对齐**  
   前端 `commentConfig.twikoo.jsUrl` 建议与后端镜像版本一致（例如 **1.7.14**），避免接口字段不匹配。

4. **人机验证**  
   若在 Twikoo 管理端开了 **Turnstile** 等验证，必须在后台配好 Site Key / Secret；否则前台会一直报错。个人站可先关验证，稳定后再开。

5. **邮箱、头像、IP**  
   WordPress 里的 Gravatar、B2 扩展字段不会自动变成 Twikoo 头像；能迁的主要是昵称、邮箱（可选）、正文、时间。敏感信息导入前可自行脱敏。

### 7.5 验证清单

- [ ] 任选一篇**确定有旧评论**的文章，打开 `/posts/xxx/`，能看到列表
- [ ] 新开一条测试评论，刷新后仍在（说明写库正常）
- [ ] Swup 从首页点进另一篇文章，评论区换成该文（不是上一篇残留）
- [ ] 留言板 `/guestbook/` 若启用评论，path 为 `customPath`，与文章不同
- [ ] 管理端 `https://你的-envId` 能登录，评论数与预期接近

若某篇文章 WordPress 时期评论为 0，迁完后为空是正常现象，不是失败。

### 7.6 做不到或不值得做的

- **和 WP 后台一模一样的审核流、通知邮件、会员等级评论**：Twikoo 另一套逻辑，别指望 1:1。
- **B2 付费隐藏、仅登录可见评论**：静态站 + Twikoo 需重新设计，不能靠迁库解决。
- **spam 评论、垃圾数据**：建议在 WXR 转 JSON 时过滤 `comment_approved != 1` 的条目。
- **精确还原每一条楼中楼**：父评论 id 映射写错时，宁可先扁平化，也不要导入半残数据把库搞挂。

---

## 迁移清单（可直接照抄）

- [ ] WordPress 导出 WXR，本地备份数据库与 `uploads`
- [ ] Fork / Clone Firefly，建自己的分支
- [ ] 图床已托管旧路径（或准备批量同步 `uploads` → 图床）
- [ ] 写迁移脚本：解析 → 转 MD → 改图床 → 写 frontmatter
- [ ] 删除 Demo 文，更新 `siteConfig` / `profileConfig`
- [ ] `pnpm check` / `pnpm build` 通过
- [ ] 抽查图多文、代码文、外链图
- [ ] 导航、友链、页脚备案、无用页面开关
- [ ] Twikoo 部署 + `commentConfig`；核对每篇文章 `comment: true`
- [ ] WXR 评论 → Twikoo JSON（含 **旧 slug → 新 `/posts/...` path** 映射）
- [ ] 抽查有历史评论的文章 + Swup 换页后评论区
- [ ] DNS / CDN 切到静态托管（Vercel / Cloudflare Pages / 自建 Nginx 等）
- [ ] 旧链接 301（若 URL 结构变化）

---

## 踩坑摘要

1. **图片正则过宽**  
   不要匹配所有站点的 `/wp-content/uploads/`，只改自己的域名和站内相对路径。

2. **单分类限制**  
   Firefly 一篇文章一个 `category`。WordPress 多分类时要定优先级（例如去掉泛化「文章」后取第一个具体分类），否则导航分组会对不齐。

3. **中文 slug**  
   `post_name` 可能是百分号编码，写入文件前要 `decodeURIComponent`；Windows 文件名还要避开非法字符。

4. **短代码不可完美还原**  
   付费隐藏、下载框等接受降级，比硬解析到构建失败更划算。

5. **主题功能默认全开**  
   Firefly Demo 带追番、相册、音乐等，个人站要主动关，不然导航和侧栏很「热闹」。

6. **评论 path 与文件名绑定**  
   改 Markdown 文件名会改 URL，历史评论若仍挂在旧 path 上会「消失」；迁移或重命名后要统一改 Twikoo 里的 `url`，或导入时就用新 path。

---

## 结果与后续

迁移完成后：

- 23 篇正文以 Markdown 落在 Git 里，可版本管理、可 PR 审稿
- 图片走自有图床，站点本体静态分发
- 导航按「文章 / 软件」内容域拆分，比 WordPress 默认分类页更符合阅读习惯
- 友链与入驻规则与旧站对齐
- 评论挂在 Twikoo，与静态构建解耦；历史评论靠 WXR + 字段映射导入

后续还可以做：

- 旧 permalink → 新 `/posts/{slug}/` 的 301 表（**评论 path 映射最好与 301 表共用同一份 slug 对照**）
- 把「WXR 评论 → Twikoo JSON」收成可复用脚本（若你还会再迁站）

---

## 结语

WordPress 适合「什么都想装一点」的阶段；当站点目标收敛成 **写文章、存笔记、换友链** 时，Astro 静态站往往更省心。

这次 Muxui 的路径可以概括成一句话：

> **WXR 导出 → 脚本转 Markdown → 图床改写 → Firefly 配置本地化 → Twikoo 接评论（path 对齐 + 导入）。**

脚本和配置都在自己的 Git 仓库里，下次换机器或重建环境，只要拉代码、装依赖、构建即可。

如果你也在迁站，欢迎在留言板交流你的导出格式和坑点——尤其是不同主题的短代码，大家踩的都不太一样。

## 相关阅读

[[alipay-face-to-face-donation-page|支付宝面对面对接个人赞赏页]]


[GitHub：CuteLeaf/Firefly](https://github.com/CuteLeaf/Firefly)
