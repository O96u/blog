import { describe, expect, it } from 'vitest'
import { mkdtempSync, mkdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { tmpdir } from 'node:os'
import { readPostFile, postsDirectory } from '../shared/blog/source.ts'

describe('post slug from frontmatter', () => {
  it('uses frontmatter slug for path, not the file name', () => {
    const root = mkdtempSync(join(tmpdir(), 'blog-slug-'))
    const directory = postsDirectory(root)
    mkdirSync(directory, { recursive: true })
    const file = join(directory, 'Chinese Title Example.md')
    writeFileSync(
      file,
      `---
slug: ai-summary-wordpress-plugin
title: 标题
description: 摘要足够长以通过校验规则的限制。
date: 2026-11-13
draft: true
---

正文
`,
    )
    const post = readPostFile(file, root)
    expect(post.slug).toBe('ai-summary-wordpress-plugin')
    expect(post.path).toBe('/posts/ai-summary-wordpress-plugin')
  })
})
