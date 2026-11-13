import { readFileSync } from 'node:fs'
import { extname } from 'node:path'
import {
  hashFile,
  loadManifest,
  logicalPathToPublicFile,
  saveManifestAtomic,
} from '../shared/blog/image-store.ts'
import { shouldUpload } from '../shared/blog/images.ts'
import { readOssConfig, uploadToOss } from '../shared/blog/oss.ts'

const rootDir = process.cwd()
const config = readOssConfig()
const manifest = loadManifest(rootDir)
const original = JSON.stringify(manifest)
let uploaded = 0
let skipped = 0

try {
  for (const [logicalPath, record] of Object.entries(manifest.images)) {
    const file = logicalPathToPublicFile(rootDir, logicalPath)
    const hash = hashFile(file)
    if (!shouldUpload(record, hash)) {
      skipped += 1
      continue
    }
    const remoteUrl = await uploadToOss(
      config,
      logicalPath.replace(/^\/media\//, ''),
      readFileSync(file),
      contentType(file),
    )
    manifest.images[logicalPath] = {
      ...record,
      hash,
      remoteUrl,
    }
    uploaded += 1
  }
  saveManifestAtomic(rootDir, manifest)
} catch (error) {
  if (JSON.stringify(loadManifest(rootDir)) !== original && JSON.stringify(manifest) !== original) {
    saveManifestAtomic(rootDir, JSON.parse(original))
  }
  throw error
}

console.log(`uploaded ${uploaded}, skipped ${skipped}`)

function contentType(file: string) {
  const extension = extname(file).toLowerCase()
  if (extension === '.webp') return 'image/webp'
  if (extension === '.png') return 'image/png'
  if (extension === '.jpg' || extension === '.jpeg') return 'image/jpeg'
  if (extension === '.gif') return 'image/gif'
  if (extension === '.avif') return 'image/avif'
  return 'application/octet-stream'
}
