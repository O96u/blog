import { existsSync, mkdtempSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, relative } from 'node:path'
import { spawnSync } from 'node:child_process'
import ts from 'typescript'
import {
  collectFences,
  collectImageReferences,
  collectInternalLinks,
  readAllPosts,
} from '../shared/blog/source.ts'
import { assertSafeImagePath } from '../shared/blog/images.ts'
import { isPublished, plainText, tagPath } from '../shared/blog/model.ts'
import { createHash } from 'node:crypto'

const rootDir = process.cwd()
const posts = readAllPosts(rootDir)
const errors: string[] = []
const warnings: string[] = []
const languages = new Set([
  'ts',
  'js',
  'vue',
  'css',
  'html',
  'bash',
  'sh',
  'shell',
  'json',
  'yaml',
  'yml',
  'md',
  'mdc',
  'python',
  'diff',
  'sql',
  'toml',
  'mermaid',
  'java',
  'php',
  'xml',
  'powershell',
  'text',
  'nginx',
  'ini',
  'css',
])
const published = posts.filter(isPublished)
const paths = new Set(published.map((post) => post.path))
const tags = new Set(published.flatMap((post) => post.tags.map((tag) => tagPath(tag))))
const staticPaths = new Set([
  '/',
  '/posts',
  '/archives',
  '/tags',
  '/search',
  '/about',
  '/rss.xml',
  '/sitemap.xml',
])

for (const post of posts) {
  let insideFence = false
  for (const [index, line] of post.body.split(/\r?\n/).entries()) {
    if (!/^\s*`{3,}[^`]*$/.test(line)) continue
    if (insideFence && line.trim() !== '```') {
      errors.push(`${post.path}:${index + 1}: 代码块结束围栏不能带语言标记`)
    }
    insideFence = !insideFence
  }
  if (insideFence) {
    errors.push(`${post.path}: 存在未闭合的代码块`)
  }
  for (const image of collectImageReferences(post)) {
    try {
      assertSafeImagePath(image)
    } catch (error) {
      errors.push(`${post.path}: ${error instanceof Error ? error.message : '图片路径无效'}`)
    }
  }
  for (const link of collectInternalLinks(post.body)) {
    if (
      staticPaths.has(link) ||
      paths.has(link) ||
      tags.has(link) ||
      link.startsWith('/posts/page/')
    ) {
      continue
    }
    errors.push(`${post.path}: 内部链接不存在 ${link}`)
  }
  for (const fence of collectFences(post.body)) {
    const language = fence.info.split(/\s+/)[0] ?? ''
    if (!language || !languages.has(language)) {
      errors.push(`${post.path}: 代码块缺少受支持的语言标记`)
      continue
    }
    if (!fence.code.trim()) {
      errors.push(`${post.path}: ${language} 代码块是空的`)
      continue
    }
    if (language === 'ts' || language === 'js') {
      const diagnostics =
        ts.transpileModule(fence.code, {
          reportDiagnostics: true,
          compilerOptions: {
            target: ts.ScriptTarget.ESNext,
            module: ts.ModuleKind.ESNext,
            ...(language === 'js' ? { jsx: ts.JsxEmit.Preserve } : {}),
          },
          fileName: language === 'ts' ? 'sample.ts' : 'sample.js',
        }).diagnostics ?? []
      const syntaxErrors = diagnostics.filter(
        (item) => item.category === ts.DiagnosticCategory.Error,
      )
      if (syntaxErrors.length > 0) {
        errors.push(`${post.path}: ${language} 代码示例语法无效`)
      }
    }
    if (language === 'js') {
      const directory = mkdtempSync(join(tmpdir(), 'blog-code-'))
      const file = join(directory, 'sample.mjs')
      writeFileSync(file, fence.code)
      const checked = spawnSync(process.execPath, ['--check', file], { encoding: 'utf8' })
      if (checked.status !== 0) {
        errors.push(`${post.path}: JavaScript 代码示例无法通过 node --check`)
      }
    }
  }
  if (post.reviewAfter && post.reviewAfter <= new Date().toISOString().slice(0, 10)) {
    warnings.push(`${post.path}: 已到复审日期 ${post.reviewAfter}`)
  }
}

const seenSlugs = new Map<string, string>()
const seenTitles = new Map<string, string>()
const seenBodies = new Map<string, string>()
for (const post of posts) {
  const previousSlug = seenSlugs.get(post.slug)
  if (previousSlug) {
    errors.push(`${post.file}: slug「${post.slug}」与 ${previousSlug} 重复`)
  }
  seenSlugs.set(post.slug, relative(rootDir, post.file).replace(/\\/g, '/'))
}
for (const post of published) {
  const previousTitle = seenTitles.get(post.title)
  if (previousTitle) {
    errors.push(`${post.path}: 标题与 ${previousTitle} 重复`)
  }
  seenTitles.set(post.title, post.path)
  const hash = createHash('sha256').update(plainText(post.body)).digest('hex')
  const previousBody = seenBodies.get(hash)
  if (previousBody) {
    errors.push(`${post.path}: 正文与 ${previousBody} 重复`)
  }
  seenBodies.set(hash, post.path)
}

if (!existsSync(join(rootDir, 'data', 'redirects.json'))) {
  errors.push('缺少 data/redirects.json')
}

for (const warning of warnings) {
  console.warn(`WARN ${warning}`)
}
if (errors.length > 0) {
  console.error(errors.join('\n'))
  process.exit(1)
}
console.log(`content check passed: ${posts.length} posts`)
