import { describe, expect, it } from 'vitest'
import MiniSearch from 'minisearch'
import {
  makeSnippet,
  searchOptions,
  tokenizeText,
  type SearchDocument,
} from '../shared/blog/search.ts'

const documents: SearchDocument[] = [
  {
    id: '/posts/phase-0-proof',
    path: '/posts/phase-0-proof',
    title: 'Phase 0 综合验证',
    description: '静态生成验证',
    tags: 'nuxt seo',
    body: 'Phase 0 静态生成验证正文 static generation proof',
  },
  {
    id: '/posts/note-06-typescript-narrowing',
    path: '/posts/note-06-typescript-narrowing',
    title: '用收窄代替随手断言',
    description: 'TypeScript 收窄',
    tags: 'typescript',
    body: '类型收窄可以去掉断言',
  },
]

describe('search', () => {
  const engine = new MiniSearch<SearchDocument>(searchOptions())
  engine.addAll(documents)

  it('tokenizes Chinese and English', () => {
    expect(tokenizeText('静态生成 Nuxt')).toEqual(expect.arrayContaining(['静态', '生成', 'nuxt']))
  })

  it('finds Chinese body text and English keywords', () => {
    expect(engine.search('静态生成').map((item) => item.id)).toContain('/posts/phase-0-proof')
    expect(engine.search('static').map((item) => item.id)).toContain('/posts/phase-0-proof')
    expect(engine.search('TypeScript').map((item) => item.id)).toContain(
      '/posts/note-06-typescript-narrowing',
    )
  })

  it('builds a snippet around the match', () => {
    expect(makeSnippet(documents[0]!.body, '静态生成')).toContain('静态生成')
  })
})
