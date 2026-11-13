import { describe, expect, it } from 'vitest'
import { formatImportedPostBody } from '../shared/blog/format-imported-post.ts'

describe('formatImportedPostBody', () => {
  it('replaces github mdc with markdown link', () => {
    const body = formatImportedPostBody('末尾\n\n::github{repo="o96u/demo"}\n')
    expect(body).toContain('[GitHub：o96u/demo](https://github.com/o96u/demo)')
    expect(body).not.toContain('::github')
  })

  it('normalizes php fence and keeps a plain closing fence', () => {
    const body = formatImportedPostBody('```JS\n<?php echo 1;\n```\n')
    expect(body).toContain('```php\n')
    expect(body).toMatch(/```php[\s\S]*```\n$/)
    expect(body).not.toContain('```text')
  })

  it('repairs migrated closing fences that incorrectly include a language', () => {
    const body = formatImportedPostBody(
      '```bash\necho first\n```text\n\n## 下一节\n\n```bash\necho second\n```yaml\n',
    )
    expect(body).toContain('```bash\necho first\n```\n\n## 下一节')
    expect(body).toContain('```bash\necho second\n```\n')
    expect(body).not.toContain('```text')
    expect(body).not.toContain('```yaml')
  })
})
