import { readdirSync, readFileSync } from 'node:fs'
import { join, relative } from 'node:path'
import { parse } from 'yaml'
import { normalizeLegacyPostFrontmatter } from './frontmatter.ts'
import { FRONTMATTER_KEYS, postPathFromSlug, postSchema, type PostMeta } from './schema.ts'
import type { BlogPost } from './model.ts'

export interface SourcePost extends BlogPost {
  slug: string
  file: string
  meta: PostMeta
}

export function parseFrontmatter(markdown: string) {
  const text = markdown.replace(/^\uFEFF/, '').replace(/\r\n/g, '\n')
  if (!text.startsWith('---\n')) {
    throw new Error('文章缺少 frontmatter')
  }
  const end = text.indexOf('\n---\n', 4)
  if (end < 0) {
    throw new Error('frontmatter 没有结束标记')
  }
  const data = parse(text.slice(4, end))
  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    throw new Error('frontmatter 必须是映射')
  }
  return {
    data: data as Record<string, unknown>,
    body: text.slice(end + 5),
  }
}

export function assertKnownFrontmatter(data: Record<string, unknown>, file: string) {
  const allowed = new Set<string>(FRONTMATTER_KEYS)
  for (const key of Object.keys(data)) {
    if (!allowed.has(key)) {
      throw new Error(`${file} 包含未知 frontmatter 字段 ${key}`)
    }
  }
}

export function postsDirectory(rootDir: string) {
  return join(rootDir, 'content', 'posts')
}

function walkMarkdown(directory: string): string[] {
  const entries = readdirSync(directory, { withFileTypes: true })
  const files: string[] = []
  for (const entry of entries) {
    const fullPath = join(directory, entry.name)
    if (entry.isDirectory()) {
      files.push(...walkMarkdown(fullPath))
    } else if (entry.isFile() && entry.name.endsWith('.md')) {
      files.push(fullPath)
    }
  }
  return files
}

export function readPostFile(file: string, rootDir: string): SourcePost {
  const relativeFile = relative(rootDir, file).replace(/\\/g, '/')
  const markdown = readFileSync(file, 'utf8')
  const { data: raw, body } = parseFrontmatter(markdown)
  const data = normalizeLegacyPostFrontmatter(raw, relativeFile)
  assertKnownFrontmatter(data, relativeFile)
  const parsed = postSchema.safeParse(data)
  if (!parsed.success) {
    const message = parsed.error.issues
      .map((issue) => `${issue.path.join('.') || 'frontmatter'}: ${issue.message}`)
      .join('；')
    throw new Error(`${relativeFile} ${message}`)
  }
  if (parsed.data.updated && parsed.data.updated < parsed.data.date) {
    throw new Error(`${relativeFile} 的 updated 早于 date`)
  }
  const slug = parsed.data.slug
  const post: SourcePost = {
    ...parsed.data,
    slug,
    path: postPathFromSlug(slug),
    file,
    body,
    meta: parsed.data,
  }
  return post
}

export function readAllPosts(rootDir: string) {
  return walkMarkdown(postsDirectory(rootDir))
    .sort((left, right) => left.localeCompare(right))
    .map((file) => readPostFile(file, rootDir))
}

const MARKDOWN_IMAGE = /!\[[^\]]*]\(([^)\s]+)(?:\s+"[^"]*")?\)/g
const HTML_IMAGE = /<img\b[^>]*\bsrc=["']([^"']+)["']/gi
const MARKDOWN_LINK = /(?<!!)\[[^\]]+]\(([^)\s]+)(?:\s+"[^"]*")?\)/g
const FENCE = /```([^\n`]*)\n([\s\S]*?)```/g

export function collectImageReferences(post: Pick<SourcePost, 'cover' | 'body'>) {
  const references = new Set<string>()
  const body = post.body ?? ''
  if (post.cover) {
    references.add(post.cover)
  }
  for (const match of body.matchAll(MARKDOWN_IMAGE)) {
    references.add(match[1] ?? '')
  }
  for (const match of body.matchAll(HTML_IMAGE)) {
    references.add(match[1] ?? '')
  }
  return [...references]
}

export function collectInternalLinks(body: string) {
  const links: string[] = []
  for (const match of body.matchAll(MARKDOWN_LINK)) {
    const target = match[1] ?? ''
    if (target.startsWith('/') && !target.startsWith('//')) {
      links.push(target.split('#')[0]?.split('?')[0] ?? target)
    }
  }
  return links
}

export function collectFences(body: string) {
  return [...body.matchAll(FENCE)].map((match) => ({
    info: (match[1] ?? '').trim(),
    code: match[2] ?? '',
  }))
}
