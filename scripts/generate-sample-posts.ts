import { mkdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const notes = [
  ['note-01-pin-order', '置顶顺序不进入归档', 'nuxt', true, 1],
  ['note-02-list-order', '列表置顶的第二优先级', 'nuxt', true, 2],
  ['note-03-comments-off', '关闭评论时不加载讨论脚本', 'vue', false, 0],
  ['note-04-unsearchable', '从全文索引排除内部备忘', 'vue', false, 0],
  ['note-05-internal-links', '站内链接只指向已发布页面', 'seo', false, 0],
  ['note-06-typescript-narrowing', '用收窄代替随手断言', 'typescript', false, 0],
  ['note-07-vue-reactivity', '响应式状态放在边界内', 'vue', false, 0],
  ['note-08-css-containment', '用容器限制布局溢出', 'css', false, 0],
  ['note-09-node-streams', '流式处理避免一次性读入大文件', 'node', false, 0],
  ['note-10-vitest-fixtures', '把排序规则做成纯函数测试', 'testing', false, 0],
  ['note-11-canonical-url', '规范链接去掉查询和哈希', 'seo', false, 0],
  ['note-12-sitemap-drafts', '站点地图不收录草稿', 'seo', false, 0],
  ['note-13-static-payload', '静态 payload 只保留公开文章', 'performance', false, 0],
  ['note-14-font-loading', '首屏不下载多余字体', 'css', false, 0],
  ['note-15-image-pipeline', '图片路径与图床地址分离', 'nuxt', false, 0],
  ['note-16-markdown-toc', '目录跟随标题深度生成', 'nuxt', false, 0],
  ['note-17-tag-pages', '标签页使用稳定 slug', 'nuxt', false, 0],
  ['note-18-archive-order', '归档按日期而不是置顶排序', 'nuxt', false, 0],
  ['note-19-related-posts', '相关文章按共同标签打分', 'nuxt', false, 0],
  ['note-20-javascript-sample', 'JavaScript 示例保持可检查', 'node', false, 0],
  ['note-21-typescript-sample', 'TypeScript 示例保持语法有效', 'typescript', false, 0],
  ['note-22-playwright-smoke', '用端到端测试走公开路由', 'testing', false, 0],
  ['note-23-nginx-try-files', '静态站点用 try_files 返回真实 404', 'node', false, 0],
  ['note-24-rss-absolute-url', 'RSS 链接使用绝对地址', 'seo', false, 0],
  ['note-25-json-ld', '文章页输出 BlogPosting', 'seo', false, 0],
  ['note-26-color-mode', '深浅色切换不重载页面', 'css', false, 0],
  ['note-27-search-index', '搜索索引在打开时再加载', 'nuxt', false, 0],
  ['note-28-rollback-release', '发布失败时切回上一份静态目录', 'node', false, 0],
  ['note-29-content-schema', 'Frontmatter 用同一份校验', 'typescript', false, 0],
  ['note-30-reading-time', '阅读时间按中英文混合估算', 'nuxt', false, 0],
] as const

const directory = join(process.cwd(), 'content', 'posts')
mkdirSync(directory, { recursive: true })

notes.forEach((note, index) => {
  const [slug, title, tag, pinned, pinOrder] = note
  const date = addDays('2025-01-06', index * 9)
  const extra = extraBody(slug)
  const comments = slug !== 'note-03-comments-off'
  const searchable = slug !== 'note-04-unsearchable'
  const cover =
    slug === 'note-15-image-pipeline' ? '\ncover: /media/posts/covers/pipeline.webp' : ''
  const pin = pinned ? `\npinned: true\npinOrder: ${pinOrder}` : ''
  writeFileSync(
    join(directory, `${slug}.md`),
    `---
slug: ${slug}
title: ${title}
description: ${title}。这篇笔记的 slug 是 ${slug}。
date: ${date}
draft: false${pin}${cover}
tags:
  - ${tag}
toc: true
comments: ${comments}
searchable: ${searchable}
---

${title}讨论一个可以重复执行的工程做法。文章标识是 ${slug}。

${extra}
`,
  )
})

writeFileSync(
  join(directory, 'private-note.md'),
  `---
slug: private-note
title: 不进入索引的公开备忘
description: 这篇文章可以访问，但要求搜索引擎不要索引。
date: 2025-12-01
draft: false
tags:
  - seo
toc: false
comments: false
searchable: false
seo:
  noindex: true
---

这是一篇 noindex 备忘，标识 private-note。它不应该出现在 sitemap 里。
`,
)

writeFileSync(
  join(directory, 'unpublished-draft.md'),
  `---
slug: unpublished-draft
title: 未发布草稿
description: 这篇草稿不能进入生产构建。
date: 2025-12-02
draft: true
tags:
  - nuxt
toc: false
comments: false
searchable: false
---

DRAFT_LEAK_SENTINEL 这段文字只能留在源文件里。
`,
)

console.log(`wrote ${notes.length + 2} sample posts`)

function addDays(iso: string, days: number) {
  const [year, month, day] = iso.split('-').map(Number)
  const date = new Date(Date.UTC(year, (month ?? 1) - 1, day))
  date.setUTCDate(date.getUTCDate() + days)
  return date.toISOString().slice(0, 10)
}

function extraBody(slug: string) {
  if (slug === 'note-05-internal-links') {
    return '相关阅读见 [综合验证](/posts/phase-0-proof) 和 [归档](/archives)。'
  }
  if (slug === 'note-15-image-pipeline') {
    return '封面和正文使用同一条逻辑路径。\n\n![构建流水线](/media/posts/covers/pipeline.webp)'
  }
  if (slug === 'note-20-javascript-sample') {
    return '```js\nexport function add(left, right) {\n  return left + right\n}\n```'
  }
  if (slug === 'note-21-typescript-sample') {
    return '```ts\nexport function add(left: number, right: number): number {\n  return left + right\n}\n```'
  }
  if (slug === 'note-27-search-index') {
    return '搜索关键词包含中文分词和英文 Nuxt。'
  }
  return `继续把 ${slug} 的结论写清楚，避免和别的笔记重复。`
}
