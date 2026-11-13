import { createHash } from 'node:crypto'
import { existsSync, mkdirSync, readFileSync, renameSync, writeFileSync } from 'node:fs'
import { dirname, join, relative } from 'node:path'
import {
  emptyManifest,
  imageModeFromEnv,
  publicPathToObjectKey,
  resolveImageUrl,
  type ImageMode,
} from './images.ts'
import { imageManifestSchema, type ImageManifest } from './schema.ts'
import { collectImageReferences, readAllPosts, type SourcePost } from './source.ts'
import { isPublished } from './model.ts'

export function manifestPath(rootDir: string) {
  return join(rootDir, 'data', 'image-manifest.json')
}

export function loadManifest(rootDir: string): ImageManifest {
  const file = manifestPath(rootDir)
  if (!existsSync(file)) {
    return emptyManifest()
  }
  const parsed = imageManifestSchema.safeParse(JSON.parse(readFileSync(file, 'utf8')))
  if (!parsed.success) {
    throw new Error(
      `图片 Manifest 无效：${parsed.error.issues.map((issue) => issue.message).join('；')}`,
    )
  }
  return parsed.data
}

export function saveManifestAtomic(rootDir: string, manifest: ImageManifest) {
  const file = manifestPath(rootDir)
  mkdirSync(dirname(file), { recursive: true })
  const temporary = `${file}.${process.pid}.tmp`
  writeFileSync(temporary, `${JSON.stringify(manifest, null, 2)}\n`)
  renameSync(temporary, file)
}

export function logicalPathToPublicFile(rootDir: string, logicalPath: string) {
  return join(rootDir, 'public', logicalPath.replace(/^\//, ''))
}

export function referencedImages(posts: SourcePost[], includeDrafts = false) {
  const selected = includeDrafts ? posts : posts.filter(isPublished)
  const references = new Map<string, string[]>()
  for (const post of selected) {
    for (const image of collectImageReferences(post)) {
      const users = references.get(image) ?? []
      users.push(post.path)
      references.set(image, users)
    }
  }
  return references
}

export function verifyImages(rootDir: string, mode: ImageMode = imageModeFromEnv()) {
  const posts = readAllPosts(rootDir)
  const manifest = loadManifest(rootDir)
  const errors: string[] = []
  for (const [image, users] of referencedImages(posts)) {
    const where = users.join(', ')
    try {
      resolveImageUrl(image, {
        mode,
        manifest,
        absolute: mode === 'remote',
        siteUrl: 'https://blog.example.com',
      })
    } catch (error) {
      errors.push(`${where}: ${error instanceof Error ? error.message : '图片无法解析'}`)
      continue
    }
    const file = logicalPathToPublicFile(rootDir, image)
    if (!existsSync(file)) {
      errors.push(`${where}: 缺少本地图片 ${relative(rootDir, file).replace(/\\/g, '/')}`)
    }
  }
  if (errors.length > 0) {
    throw new Error(errors.join('\n'))
  }
  return { mode, count: referencedImages(posts).size }
}

export function hashFile(file: string) {
  return createHash('sha256').update(readFileSync(file)).digest('hex')
}

export function objectKeyFor(logicalPath: string) {
  return publicPathToObjectKey(logicalPath)
}
