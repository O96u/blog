import { describe, expect, it } from 'vitest'
import { postSchema } from '../shared/blog/schema.ts'
import {
  getArchiveGroups,
  getPostSurroundings,
  getPublishedPosts,
  getRelatedPosts,
  isIndexable,
  paginate,
  postsListPageFromQuery,
  postsListRouteLocation,
  readingMinutes,
  type BlogPost,
} from '../shared/blog/model.ts'

function post(partial: Partial<BlogPost> & Pick<BlogPost, 'path' | 'title' | 'date'>): BlogPost {
  return {
    description: partial.title,
    draft: false,
    pinned: false,
    tags: [],
    toc: true,
    comments: true,
    searchable: true,
    ...partial,
  }
}

const posts = [
  post({ path: '/posts/old', title: '旧文', date: '2024-01-01', tags: ['nuxt'] }),
  post({
    path: '/posts/new',
    title: '新文',
    date: '2025-01-01',
    tags: ['nuxt', 'vue'],
    pinned: true,
    pinOrder: 2,
  }),
  post({
    path: '/posts/pin',
    title: '置顶',
    date: '2023-01-01',
    tags: ['css'],
    pinned: true,
    pinOrder: 1,
  }),
  post({ path: '/posts/hidden', title: '草稿', date: '2026-01-01', draft: true }),
  post({ path: '/posts/quiet', title: '不索引', date: '2025-06-01', seo: { noindex: true } }),
]

describe('post ordering', () => {
  it('defaults draft to true', () => {
    expect(
      postSchema.parse({
        slug: 'sample-post',
        title: '标题',
        description: '摘要',
        date: '2026-11-13',
      }).draft,
    ).toBe(true)
  })

  it('pins only the public list', () => {
    expect(getPublishedPosts(posts).map((item) => item.path)).toEqual([
      '/posts/pin',
      '/posts/new',
      '/posts/quiet',
      '/posts/old',
    ])
  })

  it('keeps archives and surroundings on date order', () => {
    expect(getArchiveGroups(posts).map((group) => group.year)).toEqual(['2025', '2024', '2023'])
    expect(getPostSurroundings(posts, '/posts/new')).toMatchObject({
      previous: { path: '/posts/quiet' },
      next: { path: '/posts/old' },
    })
  })

  it('excludes noindex posts from the indexable set and finds related posts', () => {
    expect(isIndexable(posts[4]!)).toBe(false)
    expect(getRelatedPosts(posts, posts[1]!).map((item) => item.path)).toContain('/posts/old')
  })

  it('paginates without dropping items', () => {
    const page = paginate(getPublishedPosts(posts), 2, 2)
    expect(page.totalPages).toBe(2)
    expect(page.items).toHaveLength(2)
  })

  it('builds SPA list routes on /posts with query', () => {
    expect(postsListPageFromQuery({})).toBe(1)
    expect(postsListPageFromQuery({ page: '3' })).toBe(3)
    expect(postsListRouteLocation(1, { q: 'nuxt', page: '2' })).toEqual({
      path: '/posts',
      query: { q: 'nuxt' },
    })
    expect(postsListRouteLocation(2, { tag: 'vue' })).toEqual({
      path: '/posts',
      query: { tag: 'vue', page: '2' },
    })
  })

  it('estimates reading time from mixed text', () => {
    expect(readingMinutes('静态生成 '.repeat(400))).toBeGreaterThan(1)
  })
})
