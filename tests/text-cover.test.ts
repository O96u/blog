import { describe, expect, it } from 'vitest'
import { postSlugFromPath, textCoverSnippet, textCoverVariant } from '../shared/blog/text-cover'

describe('text cover', () => {
  it('derives slug from post path', () => {
    expect(postSlugFromPath('/posts/phase-0-proof')).toBe('phase-0-proof')
  })

  it('picks a stable variant for the same slug', () => {
    expect(textCoverVariant('phase-0-proof')).toBe(textCoverVariant('phase-0-proof'))
    expect(textCoverVariant('note-01-pin-order')).toBeGreaterThanOrEqual(0)
    expect(textCoverVariant('note-01-pin-order')).toBeLessThan(6)
  })

  it('builds stable snippet lines from slug', () => {
    expect(textCoverSnippet('phase-0-proof')).toEqual(textCoverSnippet('phase-0-proof'))
    expect(textCoverSnippet('phase-0-proof').length).toBe(3)
  })
})
