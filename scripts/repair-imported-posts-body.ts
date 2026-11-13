import { readFileSync, writeFileSync } from 'node:fs'
import { relative } from 'node:path'
import { stringify } from 'yaml'
import { formatImportedPostBody } from '../shared/blog/format-imported-post.ts'
import { parseFrontmatter, readAllPosts } from '../shared/blog/source.ts'

const rootDir = process.cwd()

const IMPORTED_SLUGS = new Set([
  'adobe-photoshop-2023',
  'finalshell-pro-activation',
  'java-thread-pool-guide',
  'java-thread-fundamentals',
  'kms-activation-tool',
  'mac-disk-eject-fix',
  'mihomo-personal-config',
  'mybatis-code-helper-pro',
  'mysql-knowledge-notes',
  'proxmox-ve-setup',
  'typora-1-10-8-portable-edition',
  'windows-update-blocker',
  'yolo-mahjong-onnx-export',
  'ai-summary-wordpress-plugin',
  'dbx-open-source-database-client',
  'windows-permanent-activation-guide',
  'wordpress-to-astro-migration',
  'cloudflare-workers-telegram-d1-anonymous-chat',
  'alipay-face-to-face-donation-page',
  'python-lottery-qinglong-notification-script',
  'headscale-derp-self-hosted-guide',
])

function serializeFrontmatter(meta: Record<string, unknown>) {
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
  const ordered: Record<string, unknown> = {}
  for (const key of keys) {
    if (meta[key] !== undefined) {
      ordered[key] = meta[key]
    }
  }
  return stringify(ordered, { lineWidth: 0, defaultKeyOrder: false }).trimEnd()
}

let changed = 0
for (const post of readAllPosts(rootDir)) {
  if (!IMPORTED_SLUGS.has(post.slug)) {
    continue
  }
  const markdown = readFileSync(post.file, 'utf8')
  const { body } = parseFrontmatter(markdown)
  const nextBody = formatImportedPostBody(body)
  const frontmatter = serializeFrontmatter(post.meta as Record<string, unknown>)
  writeFileSync(post.file, `---\n${frontmatter}\n---\n\n${nextBody}`, 'utf8')
  changed += 1
  console.log('repaired', relative(rootDir, post.file))
}

console.log(`done: ${changed} posts`)
