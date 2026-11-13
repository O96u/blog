import { rmSync } from 'node:fs'
import { resolve } from 'node:path'
import { defineNuxtModule } from '@nuxt/kit'
import { normalizeLegacyPostFrontmatter } from '../shared/blog/frontmatter.ts'
import { postPathFromSlug } from '../shared/blog/schema.ts'
import { parseFrontmatter } from '../shared/blog/source.ts'
import { verifyImages } from '../shared/blog/image-store.ts'

export default defineNuxtModule({
  meta: { name: 'blog-platform' },
  setup(_options, nuxt) {
    const productionBuild = !nuxt.options.dev && !nuxt.options._prepare
    if (productionBuild) {
      for (const file of ['contents.sqlite', 'contents.sqlite-wal', 'contents.sqlite-shm']) {
        rmSync(resolve(nuxt.options.rootDir, '.data', 'content', file), { force: true })
      }
    }

    nuxt.hook('content:file:afterParse', (ctx: { collection?: { name?: string }; content?: Record<string, unknown> }) => {
      if (ctx.collection?.name !== 'posts' || !ctx.content) {
        return
      }
      const normalized = normalizeLegacyPostFrontmatter(
        ctx.content as Record<string, unknown>,
        typeof ctx.content.id === 'string' ? ctx.content.id : undefined,
      )
      Object.assign(ctx.content, normalized)
      const slug = ctx.content.slug
      if (typeof slug === 'string' && slug.length > 0) {
        ctx.content.path = postPathFromSlug(slug)
      }
    })

    nuxt.hook(
      'content:file:beforeParse',
      (ctx: { collection?: { name?: string }; file?: { body?: string; path?: string } }) => {
        if (!productionBuild || ctx.collection?.name !== 'posts') {
          return
        }
        const { data } = parseFrontmatter(String(ctx.file?.body ?? ''))
        if (data.draft !== false) {
          throw new Error(
            `draft excluded from production database: ${ctx.file?.path ?? 'unknown post'}`,
          )
        }
      },
    )

    nuxt.hook('nitro:build:before', () => {
      if (productionBuild) {
        verifyImages(nuxt.options.rootDir)
      }
    })
  },
})
