import type { ImageManifest } from './schema.ts'

export const LOGICAL_IMAGE_PATH =
  /^\/media\/posts\/(?:[a-z0-9][a-z0-9_-]*\/)*[a-z0-9][a-z0-9_-]*\.(?:png|jpe?g|webp|gif|avif)$/

export type ImageMode = 'local' | 'remote'

export function imageModeFromEnv(value = process.env.NUXT_PUBLIC_IMAGE_MODE): ImageMode {
  return value === 'remote' ? 'remote' : 'local'
}

/** 迁稿过渡期：frontmatter / 正文里尚未改成 /media/posts 的 https 封面，允许直出（RSS、阅读页） */
export function isLegacyHttpsImageUrl(input: string) {
  const value = input.trim()
  if (value !== input.trim()) {
    return false
  }
  try {
    const url = new URL(value)
    return url.protocol === 'https:' && Boolean(url.hostname)
  } catch {
    return false
  }
}

export function assertSafeImagePath(input: string) {
  const value = input.trim()
  if (
    value !== input.trim() ||
    !value.startsWith('/media/posts/') ||
    value.includes('..') ||
    value.includes('\\') ||
    value.includes('//') ||
    value.includes('?') ||
    value.includes('#') ||
    /^[a-z]+:/i.test(value) ||
    !LOGICAL_IMAGE_PATH.test(value)
  ) {
    throw new Error(`非法图片路径：${input}`)
  }
  return value
}

export function emptyManifest(): ImageManifest {
  return { version: 1, images: {} }
}

export function resolveImageUrl(
  input: string,
  options: {
    mode: ImageMode
    manifest: ImageManifest
    absolute?: boolean
    siteUrl?: string
  },
) {
  if (isLegacyHttpsImageUrl(input)) {
    return input.trim()
  }
  const path = assertSafeImagePath(input)
  if (options.mode === 'remote') {
    const remoteUrl = options.manifest.images[path]?.remoteUrl
    if (!remoteUrl) {
      throw new Error(`远程图片缺少映射：${path}`)
    }
    return remoteUrl
  }
  if (options.absolute) {
    if (!options.siteUrl) {
      throw new Error('绝对图片地址需要站点 URL')
    }
    return new URL(path, options.siteUrl).href
  }
  return path
}

export function shouldUpload(
  record: { hash?: string; remoteUrl?: string } | undefined,
  hash: string,
) {
  return record?.hash !== hash || !record.remoteUrl
}

export function publicPathToObjectKey(logicalPath: string) {
  return assertSafeImagePath(logicalPath).replace(/^\/media\//, '')
}
