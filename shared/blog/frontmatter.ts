import { postSlugSchema } from './schema.ts'

/** WordPress / 旧站 frontmatter → 本仓库 schema（映射后删除，不算「未知字段」） */
const LEGACY_FRONTMATTER_KEYS = new Set(['published', 'image', 'comment', 'category'])

const TAG_ALIASES: Record<string, string> = {
  开源: 'opensource',
  插件: 'plugin',
  数据库: 'database',
  瞎折腾: 'diy',
  图床: 'image-host',
  脚本: 'script',
}

function normalizeTag(tag: string, file?: string) {
  const trimmed = tag.trim()
  const aliased = TAG_ALIASES[trimmed]
  if (aliased) {
    return aliased
  }
  const lower = trimmed.toLowerCase()
  if (postSlugSchema.safeParse(lower).success) {
    return lower
  }
  const where = file ? `${file}：` : ''
  throw new Error(`${where}标签「${tag}」须为小写英文、数字和连字符（可在 frontmatter 中直接改写）`)
}

/**
 * 将迁移遗留字段折成 schema 认可的键，便于随后做 FRONTMATTER_KEYS 白名单校验。
 */
export function normalizeLegacyPostFrontmatter(
  data: Record<string, unknown>,
  file?: string,
): Record<string, unknown> {
  const next: Record<string, unknown> = { ...data }

  if (next.date === undefined && typeof next.published === 'string') {
    next.date = next.published
  }
  delete next.published

  if (next.cover === undefined && typeof next.image === 'string') {
    const image = next.image.trim()
    if (image) {
      next.cover = image
    }
  }
  delete next.image

  if (next.comments === undefined && typeof next.comment === 'boolean') {
    next.comments = next.comment
  }
  delete next.comment

  delete next.category

  if (Array.isArray(next.tags)) {
    next.tags = next.tags.map((tag) => normalizeTag(String(tag), file))
  }

  if (typeof next.description === 'string' && next.description.length > 180) {
    next.description = next.description.slice(0, 180)
  }

  return next
}

export function isLegacyFrontmatterKey(key: string) {
  return LEGACY_FRONTMATTER_KEYS.has(key)
}
