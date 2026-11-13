import type { BlogPost } from '~~/shared/blog/model'
import {
  getArchiveGroups,
  getPinnedPosts,
  getPostSurroundings,
  getPostsByTag,
  getPublishedPosts,
  getRelatedPosts,
  readingMinutes,
  sortChronological,
} from '~~/shared/blog/model'

interface ContentRow {
  path: string
  title?: string
  description?: string
  date?: string
  updated?: string
  draft?: boolean
  pinned?: boolean
  pinOrder?: number
  tags?: string[]
  cover?: string
  toc?: boolean
  comments?: boolean
  searchable?: boolean
  seo?: BlogPost['seo']
  tech?: string[]
  reviewAfter?: string
  rawbody?: string
  body?: unknown
}

export function normalizePost(row: ContentRow): BlogPost & { document: ContentRow } {
  return {
    path: row.path,
    title: row.title || '未命名文章',
    description: row.description || '',
    date: row.date || '1970-01-01',
    updated: row.updated,
    draft: row.draft !== false,
    pinned: row.pinned === true,
    pinOrder: row.pinOrder,
    tags: row.tags ?? [],
    cover: row.cover,
    toc: row.toc !== false,
    comments: row.comments !== false,
    searchable: row.searchable !== false,
    seo: row.seo,
    tech: row.tech,
    reviewAfter: row.reviewAfter,
    body: row.rawbody,
    document: row,
  }
}

export type BlogIndexData = {
  posts: Array<BlogPost & { document: ContentRow }>
  published: BlogPost[]
  pinned: BlogPost[]
  chronological: BlogPost[]
  archives: ReturnType<typeof getArchiveGroups>
}

function readCachedBlogIndex(nuxtApp: ReturnType<typeof useNuxtApp>): BlogIndexData | undefined {
  const live = useNuxtData('blog:index').data.value as BlogIndexData | undefined
  if (live) {
    return live
  }
  const key = 'blog:index'
  return (nuxtApp.payload.data[key] ?? nuxtApp.static.data[key]) as BlogIndexData | undefined
}

export async function useBlogIndex() {
  const nuxtApp = useNuxtApp()
  const cached = readCachedBlogIndex(nuxtApp)
  if (cached) {
    return cached
  }
  const { data } = await useAsyncData(
    'blog:index',
    async () => {
      const rows = await queryCollection('posts').all()
      const posts = rows.map((row) => normalizePost(row as ContentRow))
      const published = getPublishedPosts(posts)
      return {
        posts,
        published,
        pinned: getPinnedPosts(posts),
        chronological: sortChronological(published),
        archives: getArchiveGroups(posts),
      }
    },
    {
      getCachedData(key) {
        return nuxtApp.payload.data[key] ?? nuxtApp.static.data[key]
      },
    },
  )
  if (!data.value) {
    throw createError({ statusCode: 500, statusMessage: '文章索引不可用', fatal: true })
  }
  return data.value
}

export function surroundingsOf(posts: Array<BlogPost & { document: ContentRow }>, path: string) {
  return getPostSurroundings(posts, path)
}

export function relatedOf(posts: Array<BlogPost & { document: ContentRow }>, current: BlogPost) {
  return getRelatedPosts(posts, current)
}

export function postsByTag(posts: Array<BlogPost & { document: ContentRow }>, tag: string) {
  return getPostsByTag(posts, tag)
}

export function minutesOf(post: BlogPost) {
  return readingMinutes(`${post.title} ${post.description} ${post.body ?? ''}`)
}
