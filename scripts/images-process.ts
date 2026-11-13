import { mkdirSync, readdirSync } from 'node:fs'
import { dirname, join, relative } from 'node:path'
import sharp from 'sharp'
import {
  hashFile,
  loadManifest,
  logicalPathToPublicFile,
  saveManifestAtomic,
} from '../shared/blog/image-store.ts'
import { assertSafeImagePath } from '../shared/blog/images.ts'

const rootDir = process.cwd()
const sourceRoot = join(rootDir, 'images-original', 'posts')
mkdirSync(join(sourceRoot, 'covers'), { recursive: true })
await sharp({
  create: { width: 1200, height: 630, channels: 3, background: '#115e59' },
})
  .png()
  .toFile(join(sourceRoot, 'covers', 'pipeline.png'))

const manifest = loadManifest(rootDir)
let processed = 0
for (const file of walk(sourceRoot)) {
  const relativeFile = relative(sourceRoot, file).replace(/\\/g, '/')
  const targetRelative = relativeFile.replace(/\.[^.]+$/, '.webp')
  const logicalPath = assertSafeImagePath(`/media/posts/${targetRelative}`)
  const target = logicalPathToPublicFile(rootDir, logicalPath)
  mkdirSync(dirname(target), { recursive: true })
  const image = sharp(file).rotate()
  const metadata = await image.metadata()
  const width = Math.min(metadata.width ?? 1600, 1600)
  await image.resize({ width, withoutEnlargement: true }).webp({ quality: 80 }).toFile(target)
  const output = await sharp(target).metadata()
  const current = manifest.images[logicalPath]
  manifest.images[logicalPath] = {
    hash: hashFile(target),
    width: output.width ?? width,
    height: output.height ?? 1,
    ...(current?.remoteUrl ? { remoteUrl: current.remoteUrl } : {}),
  }
  processed += 1
}
saveManifestAtomic(rootDir, manifest)
console.log(`processed ${processed} images`)

function walk(directory: string): string[] {
  const files: string[] = []
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const fullPath = join(directory, entry.name)
    if (entry.isDirectory()) {
      files.push(...walk(fullPath))
    } else if (entry.isFile()) {
      files.push(fullPath)
    }
  }
  return files
}
