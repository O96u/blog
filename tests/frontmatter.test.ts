import { describe, expect, it } from 'vitest'
import { normalizeLegacyPostFrontmatter } from '../shared/blog/frontmatter.ts'
import { assertKnownFrontmatter } from '../shared/blog/source.ts'

describe('legacy post frontmatter', () => {
  it('maps WordPress keys then passes FRONTMATTER_KEYS check', () => {
    const raw = {
      title: 't',
      published: '2025-09-19',
      image: 'https://example.com/cover.webp',
      comment: true,
      category: '原创',
      slug: 'sample-post',
      description: 'x'.repeat(200),
      tags: ['WordPress', '插件'],
      draft: false,
    }
    const data = normalizeLegacyPostFrontmatter(raw, 'content/posts/x.md')
    expect(data.date).toBe('2025-09-19')
    expect(data.cover).toBe('https://example.com/cover.webp')
    expect(data.comments).toBe(true)
    expect(data.category).toBeUndefined()
    expect((data.description as string).length).toBe(180)
    expect(data.tags).toEqual(['wordpress', 'plugin'])
    expect(() => assertKnownFrontmatter(data, 'content/posts/x.md')).not.toThrow()
  })
})
