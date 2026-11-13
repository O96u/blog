import { existsSync, readFileSync, readdirSync } from 'node:fs'
import { join, relative } from 'node:path'
import {
  canonicalUrl,
  isIndexable,
  PAGE_SIZE,
  postsPagePath,
  tagPath,
} from '../shared/blog/model.ts'
import { readAllPosts } from '../shared/blog/source.ts'
import { DEFAULT_SITE_URL } from '../shared/blog/feeds.ts'

const rootDir = process.cwd()
const output = join(rootDir, '.output', 'public')
const origin = (process.env.NUXT_SITE_URL || DEFAULT_SITE_URL).replace(/\/$/, '')
const posts = readAllPosts(rootDir)
const errors: string[] = []

if (!existsSync(output)) {
  throw new Error('缺少 .output/public，请先运行 pnpm generate')
}

const files = walk(output).filter(
  (file) =>
    file.endsWith('.html') ||
    file.endsWith('.xml') ||
    file.endsWith('.txt') ||
    file.endsWith('.json'),
)
const combined = files.map((file) => readFileSync(file, 'utf8')).join('\n')
if (combined.includes('DRAFT_LEAK_SENTINEL')) {
  errors.push('生产产物包含草稿哨兵字符串')
}

const sitemap = readFileSync(join(output, 'sitemap.xml'), 'utf8')
const rss = readFileSync(join(output, 'rss.xml'), 'utf8')
if (!rss.startsWith('<?xml') || !rss.includes('<rss version="2.0">') || !rss.includes('</rss>')) {
  errors.push('RSS 不是有效的 RSS 2.0 文档')
}

for (const post of posts) {
  const location = `<loc>${canonicalUrl(post.path, origin)}</loc>`
  if (!isIndexable(post) && sitemap.includes(location)) {
    errors.push(`sitemap 包含不可索引文章 ${post.path}`)
  }
  if (isIndexable(post) && !sitemap.includes(location)) {
    errors.push(`sitemap 缺少 ${post.path}`)
  }
  if (post.draft === false) {
    const html = readHtml(post.path)
    if (!html) {
      errors.push(`缺少文章 HTML ${post.path}`)
      continue
    }
    const title = post.seo?.title || post.title
    if (
      !html.includes(title) ||
      !html.includes(post.description) ||
      !html.includes(`rel="canonical" href="${canonicalUrl(post.path, origin)}"`)
    ) {
      errors.push(`文章 SEO 标记不完整 ${post.path}`)
    }
    if (!html.includes('<h1')) {
      errors.push(`文章缺少 h1 ${post.path}`)
    }
    if (post.seo?.noindex && !html.includes('noindex')) {
      errors.push(`noindex 文章没有 robots 标记 ${post.path}`)
    }
  } else if (readHtml(post.path)) {
    errors.push(`草稿被预渲染 ${post.path}`)
  }
}

if (sitemap.includes('/search')) {
  errors.push('sitemap 包含搜索页')
}
const searchHtml = readHtml('/search')
if (!searchHtml?.includes('noindex')) {
  errors.push('搜索页没有 noindex')
}
if (!rss.includes(canonicalUrl('/posts/phase-0-proof', origin))) {
  errors.push('RSS 缺少综合验证文章')
}

const publishedCount = posts.filter((post) => post.draft === false).length
const pages = Math.ceil(publishedCount / PAGE_SIZE)
for (let page = 2; page <= pages; page += 1) {
  if (!readHtml(postsPagePath(page))) {
    errors.push(`缺少分页 ${postsPagePath(page)}`)
  }
}
for (const tag of new Set(
  posts.filter((post) => post.draft === false).flatMap((post) => post.tags),
)) {
  if (!readHtml(tagPath(tag))) {
    errors.push(`缺少标签页 ${tagPath(tag)}`)
  }
}

const htmlFiles = files.filter((file) => file.endsWith('.html'))
for (const file of htmlFiles) {
  const html = readFileSync(file, 'utf8')
  for (const match of html.matchAll(/href="(\/[^"#?]*)"/g)) {
    const href = match[1] ?? ''
    if (href.startsWith('/_nuxt/') || href.startsWith('/__') || href === '/favicon.ico') {
      continue
    }
    if (!outputHas(href)) {
      errors.push(`${relative(output, file)} 死链 ${href}`)
    }
  }
}

if (errors.length > 0) {
  console.error([...new Set(errors)].join('\n'))
  process.exit(1)
}
console.log('seo audit passed')

function readHtml(route: string) {
  const candidates =
    route === '/'
      ? [join(output, 'index.html')]
      : [
          join(output, route.replace(/^\//, ''), 'index.html'),
          join(output, `${route.replace(/^\//, '')}.html`),
        ]
  const file = candidates.find((candidate) => existsSync(candidate))
  return file ? readFileSync(file, 'utf8') : ''
}

function outputHas(route: string) {
  const relativePath = route.replace(/^\//, '')
  if (relativePath && existsSync(join(output, relativePath))) {
    return true
  }
  return Boolean(readHtml(route))
}

function walk(directory: string): string[] {
  const files: string[] = []
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const fullPath = join(directory, entry.name)
    if (entry.isDirectory()) files.push(...walk(fullPath))
    else files.push(fullPath)
  }
  return files
}
