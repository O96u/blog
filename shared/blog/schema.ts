import { z } from 'zod'

export const dateString = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, '日期必须是 YYYY-MM-DD')

export const postSlugSchema = z
  .string()
  .trim()
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'slug 只能使用小写英文、数字和连字符')

export function postPathFromSlug(slug: string) {
  return `/posts/${slug}`
}

export const seoSchema = z
  .object({
    title: z.string().trim().min(1).optional(),
    description: z.string().trim().min(1).optional(),
    noindex: z.boolean().optional(),
  })
  .strict()

export const postSchema = z.object({
  slug: postSlugSchema,
  title: z.string().trim().min(1),
  description: z.string().trim().min(1).max(180),
  date: dateString,
  updated: dateString.optional(),
  draft: z.boolean().default(true),
  pinned: z.boolean().default(false),
  pinOrder: z.number().int().nonnegative().optional(),
  tags: z
    .array(
      z
        .string()
        .trim()
        .regex(/^[a-z0-9-]+$/, '标签只能使用小写英文、数字和连字符'),
    )
    .default([]),
  cover: z.string().optional(),
  toc: z.boolean().default(true),
  comments: z.boolean().default(true),
  searchable: z.boolean().default(true),
  seo: seoSchema.optional(),
  tech: z.array(z.string().trim().min(1)).optional(),
  reviewAfter: dateString.optional(),
  rawbody: z.string().optional(),
})

export type PostMeta = z.infer<typeof postSchema>

export const FRONTMATTER_KEYS = [
  'slug',
  'title',
  'description',
  'date',
  'updated',
  'draft',
  'pinned',
  'pinOrder',
  'tags',
  'cover',
  'toc',
  'comments',
  'searchable',
  'seo',
  'tech',
  'reviewAfter',
] as const

export const imageRecordSchema = z
  .object({
    hash: z.string().regex(/^[a-f0-9]{64}$/),
    width: z.number().int().positive(),
    height: z.number().int().positive(),
    remoteUrl: z
      .string()
      .url()
      .refine((value) => value.startsWith('https://'), '图床地址必须是 https')
      .optional(),
  })
  .strict()

export const imageManifestSchema = z
  .object({
    version: z.literal(1),
    images: z.record(imageRecordSchema),
  })
  .strict()

export type ImageRecord = z.infer<typeof imageRecordSchema>
export type ImageManifest = z.infer<typeof imageManifestSchema>

export const redirectSchema = z
  .object({
    from: z.string().regex(/^\/[A-Za-z0-9/_-]*$/, '重定向来源必须是站内路径'),
    to: z.string().regex(/^\/[A-Za-z0-9/_-]*$/, '重定向目标必须是站内路径'),
    status: z.literal(301),
  })
  .strict()

export const redirectListSchema = z.array(redirectSchema)
export type RedirectRule = z.infer<typeof redirectSchema>
