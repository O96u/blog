export const PAGE_SIZE = 12

export interface BlogPost {
  path: string
  title: string
  description: string
  date: string
  updated?: string
  draft: boolean
  pinned: boolean
  pinOrder?: number
  tags: string[]
  cover?: string
  toc: boolean
  comments: boolean
  searchable: boolean
  seo?: {
    title?: string
    description?: string
    noindex?: boolean
  }
  tech?: string[]
  reviewAfter?: string
  body?: string
}

export function isPublished(post: { draft?: boolean }) {
  return post.draft === false
}

export function isIndexable(post: { draft?: boolean; seo?: { noindex?: boolean } }) {
  return isPublished(post) && post.seo?.noindex !== true
}

export function seoTitle(post: Pick<BlogPost, 'title' | 'seo'>) {
  return post.seo?.title || post.title
}

export function seoDescription(post: Pick<BlogPost, 'description' | 'seo'>) {
  return post.seo?.description || post.description
}

export function tagSlug(tag: string) {
  return tag.trim().toLowerCase()
}

export function postsPagePath(page: number) {
  return page <= 1 ? '/posts' : `/posts/page/${page}`
}

/** 列表页 SPA 分页：始终在 `/posts` 上用 query，避免 `/posts` ↔ `/posts/page/N` 整页切换 */
export function postsListRouteLocation(page: number, query: Record<string, string | undefined>) {
  const next: Record<string, string> = {}
  for (const [key, value] of Object.entries(query)) {
    if (value !== undefined && value !== '' && key !== 'page') {
      next[key] = value
    }
  }
  if (page >= 2) {
    next.page = String(page)
  }
  return { path: '/posts' as const, query: next }
}

export function postsListPageFromQuery(query: Record<string, unknown>) {
  const raw = query.page
  const text = Array.isArray(raw) ? raw[0] : raw
  const n = Number(text)
  if (Number.isInteger(n) && n >= 2) {
    return n
  }
  return 1
}

export function tagPath(tag: string) {
  return `/tags/${tagSlug(tag)}`
}

function pinRank(post: Pick<BlogPost, 'pinned' | 'pinOrder'>) {
  if (!post.pinned) {
    return Number.POSITIVE_INFINITY
  }
  return post.pinOrder ?? Number.MAX_SAFE_INTEGER
}

export function sortForList<T extends Pick<BlogPost, 'pinned' | 'pinOrder' | 'date' | 'path'>>(
  posts: T[],
) {
  return [...posts].sort((left, right) => {
    const leftRank = pinRank(left)
    const rightRank = pinRank(right)
    if (leftRank !== rightRank) {
      return leftRank - rightRank
    }
    return right.date.localeCompare(left.date) || left.path.localeCompare(right.path)
  })
}

export function sortChronological<T extends Pick<BlogPost, 'date' | 'path'>>(posts: T[]) {
  return [...posts].sort(
    (left, right) => right.date.localeCompare(left.date) || left.path.localeCompare(right.path),
  )
}

export function getPublishedPosts<T extends BlogPost>(posts: T[]) {
  return sortForList(posts.filter(isPublished))
}

export function getPinnedPosts<T extends BlogPost>(posts: T[]) {
  return getPublishedPosts(posts).filter((post) => post.pinned)
}

export function getPostByPath<T extends BlogPost>(posts: T[], path: string) {
  return posts.find((post) => post.path === path)
}

export function getPostsByTag<T extends BlogPost>(posts: T[], tag: string) {
  const slug = tagSlug(tag)
  return getPublishedPosts(posts).filter((post) => post.tags.some((item) => tagSlug(item) === slug))
}

export function getIndexablePosts<T extends BlogPost>(posts: T[]) {
  return sortChronological(posts.filter(isIndexable))
}

export function getArchiveGroups<T extends BlogPost>(posts: T[]) {
  const groups = new Map<string, T[]>()
  for (const post of sortChronological(posts.filter(isPublished))) {
    const year = post.date.slice(0, 4)
    const list = groups.get(year) ?? []
    list.push(post)
    groups.set(year, list)
  }
  return [...groups.entries()].map(([year, items]) => ({ year, posts: items }))
}

export function getRelatedPosts<T extends BlogPost>(posts: T[], current: T, limit = 4) {
  return sortChronological(posts.filter(isPublished))
    .filter((post) => post.path !== current.path)
    .map((post) => ({
      post,
      score: post.tags.filter((tag) => current.tags.includes(tag)).length,
    }))
    .filter((item) => item.score > 0)
    .sort(
      (left, right) =>
        right.score - left.score ||
        right.post.date.localeCompare(left.post.date) ||
        left.post.path.localeCompare(right.post.path),
    )
    .slice(0, limit)
    .map((item) => item.post)
}

export function getPostSurroundings<T extends BlogPost>(posts: T[], path: string) {
  const ordered = sortChronological(posts.filter(isPublished))
  const index = ordered.findIndex((post) => post.path === path)
  if (index < 0) {
    return { previous: undefined, next: undefined }
  }
  return {
    previous: ordered[index - 1],
    next: ordered[index + 1],
  }
}

export function paginate<T>(items: T[], page: number, pageSize = PAGE_SIZE) {
  const total = items.length
  const totalPages = Math.max(1, Math.ceil(total / pageSize))
  const current = Number.isInteger(page) ? Math.min(Math.max(page, 1), totalPages) : 1
  const start = (current - 1) * pageSize
  return {
    items: items.slice(start, start + pageSize),
    current,
    total,
    totalPages,
  }
}

export function readingMinutes(text: string) {
  const cjk = text.match(/[\u4e00-\u9fff]/g)?.length ?? 0
  const words = text.match(/[A-Za-z0-9]+/g)?.length ?? 0
  return Math.max(1, Math.ceil((cjk + words) / 400))
}

export function plainText(markdown: string) {
  return markdown
    .replace(/^---\n[\s\S]*?\n---\n/, '')
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/:::[^\n]*|::[^\n]*/g, ' ')
    .replace(/!\[[^\]]*]\([^)]*\)/g, ' ')
    .replace(/\[([^\]]+)]\([^)]*\)/g, '$1')
    .replace(/<[^>]+>/g, ' ')
    .replace(/[#>*_~`|-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

export function canonicalUrl(path: string, siteUrl: string) {
  const url = new URL(path || '/', siteUrl)
  url.search = ''
  url.hash = ''
  if (url.pathname !== '/' && url.pathname.endsWith('/')) {
    url.pathname = url.pathname.slice(0, -1)
  }
  return url.href
}

export function collectTagNames<T extends Pick<BlogPost, 'tags'>>(posts: T[]) {
  const counts = new Map<string, number>()
  for (const post of posts) {
    for (const tag of post.tags) {
      const slug = tagSlug(tag)
      counts.set(slug, (counts.get(slug) ?? 0) + 1)
    }
  }
  return [...counts.entries()]
    .map(([slug, count]) => ({ slug, count }))
    .sort((left, right) => right.count - left.count || left.slug.localeCompare(right.slug))
}
