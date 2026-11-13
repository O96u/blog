import { readFileSync, readdirSync, writeFileSync } from 'node:fs'
import { join, relative } from 'node:path'
import { stringify } from 'yaml'
import { formatImportedPostBody } from '../shared/blog/format-imported-post.ts'
import { normalizeLegacyPostFrontmatter } from '../shared/blog/frontmatter.ts'
import { postSchema } from '../shared/blog/schema.ts'
import { parseFrontmatter, postsDirectory } from '../shared/blog/source.ts'

const rootDir = process.cwd()
const LEGACY_MARKERS = new Set(['published', 'image', 'comment', 'category'])

function hasLegacyFrontmatter(data: Record<string, unknown>) {
  return Object.keys(data).some((key) => LEGACY_MARKERS.has(key))
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

function serializeFrontmatter(meta: Record<string, unknown>) {
  const ordered: Record<string, unknown> = {}
  const keys = [
    'slug',
    'title',
    'description',
    'date',
    'updated',
    'draft',
    'pinned',
    'pinOrder',
    'tags',
    'cover',
    'toc',
    'comments',
    'searchable',
    'seo',
    'tech',
    'reviewAfter',
  ] as const
  for (const key of keys) {
    if (meta[key] !== undefined) {
      ordered[key] = meta[key]
    }
  }
  return stringify(ordered, {
    lineWidth: 0,
    defaultKeyOrder: false,
  }).trimEnd()
}

function needsRepair(markdown: string, data: Record<string, unknown>) {
  if (hasLegacyFrontmatter(data)) {
    return true
  }
  const head = markdown.slice(0, markdown.indexOf('\n---\n', 4) + 1)
  return head.includes('"slug":') || head.startsWith('---\n"slug"')
}

function formatFile(file: string) {
  const relativeFile = relative(rootDir, file).replace(/\\/g, '/')
  const markdown = readFileSync(file, 'utf8')
  const { data, body } = parseFrontmatter(markdown)
  if (!needsRepair(markdown, data)) {
    return false
  }
  const normalized = normalizeLegacyPostFrontmatter(data, relativeFile)
  const parsed = postSchema.safeParse(normalized)
  if (!parsed.success) {
    const message = parsed.error.issues.map((issue) => issue.path.join('.')).join(', ')
    throw new Error(`${relativeFile} frontmatter 无效：${message}`)
  }
  const meta = parsed.data
  const nextBody = formatImportedPostBody(body)
  const frontmatter = serializeFrontmatter(meta as Record<string, unknown>)
  const next = `---\n${frontmatter}\n---\n\n${nextBody}`
  writeFileSync(file, next, 'utf8')
  return true
}

let changed = 0
for (const file of walkMarkdown(postsDirectory(rootDir))) {
  if (formatFile(file)) {
    changed += 1
    console.log('formatted', relative(rootDir, file))
  }
}
console.log(`done: ${changed} posts`)
