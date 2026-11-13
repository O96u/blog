import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

const candidates = [
  '.output/public/posts/phase-0-proof/index.html',
  '.output/public/posts/phase-0-proof.html',
]

const htmlPath = candidates.map((path) => resolve(path)).find((path) => existsSync(path))

if (!htmlPath) {
  throw new Error(
    `Generated article HTML not found. Run pnpm generate first. Looked in: ${candidates.join(', ')}`,
  )
}

const html = readFileSync(htmlPath, 'utf8')

describe('phase 0 generated article', () => {
  it('contains the article body and GFM table', () => {
    expect(html).toContain('Phase 0 静态生成验证正文')
    expect(html).toContain('static generation proof')
    expect(html).toContain('<table')
    expect(html).toContain('已解析')
  })

  it('contains SEO title, description, and canonical', () => {
    expect(html).toContain('Phase 0 综合验证')
    expect(html).toContain('name="description"')
    expect(html).toContain('验证 Nuxt Content 3')
    expect(html).toContain('property="og:title"')
    expect(html).toMatch(
      /rel="canonical" href="https:\/\/blog\.example\.com\/posts\/phase-0-proof\/?"/,
    )
  })

  it('renders the MDC callout', () => {
    expect(html).toContain('class="callout"')
    expect(html).toContain('data-type="info"')
    expect(html).toContain('MDC Callout')
  })

  it('renders Shiki highlighting', () => {
    expect(html).toContain('shiki')
    expect(html).toContain('resolveImageUrl')
    expect(html).toContain('data-language="ts"')
  })

  it('renders KaTeX', () => {
    expect(html).toContain('katex')
    expect(html).toContain('katex-html')
  })

  it('keeps the Mermaid source in the static HTML', () => {
    expect(html).toContain('data-mermaid="true"')
    expect(html).toContain('class="mermaid"')
    expect(html).toContain('Static HTML')
  })
})
