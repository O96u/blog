import { defineCollection, defineContentConfig } from '@nuxt/content'
import { postSchema } from './shared/blog/schema.ts'

export default defineContentConfig({
  collections: {
    posts: defineCollection({
      type: 'page',
      source: 'posts/**/*.md',
      schema: postSchema,
    }),
  },
})
