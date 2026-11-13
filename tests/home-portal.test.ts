import { describe, expect, it } from 'vitest'
import { homeTopicsWithPosts, postsMatchingTopicTags } from '../shared/blog/home-portal'
import type { BlogPost } from '../shared/blog/model'

const sample: BlogPost[] = [
  {
    path: '/posts/a',
    title: 'A',
    description: '',
    date: '2026-01-02',
    draft: false,
    pinned: false,
    tags: ['nuxt'],
    toc: true,
    comments: true,
    searchable: true,
  },
  {
    path: '/posts/b',
    title: 'B',
    description: '',
    date: '2026-01-01',
    draft: false,
    pinned: false,
    tags: ['seo'],
    toc: true,
    comments: true,
    searchable: true,
  },
]

describe('home-portal topics', () => {
  it('hides empty topics', () => {
    const items = homeTopicsWithPosts(sample)
    expect(items.some((item) => item.topic.id === 'ai')).toBe(false)
    expect(items.some((item) => item.topic.id === 'frontend')).toBe(true)
  })

  it('matches posts by tag slug', () => {
    expect(postsMatchingTopicTags(sample, ['seo']).map((post) => post.path)).toEqual(['/posts/b'])
  })
})
