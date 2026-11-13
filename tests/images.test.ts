import { mkdtempSync, readFileSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { assertSafeImagePath, resolveImageUrl, shouldUpload } from '../shared/blog/images.ts'
import { saveManifestAtomic } from '../shared/blog/image-store.ts'
import { ossStringToSign } from '../shared/blog/oss.ts'
import type { ImageManifest } from '../shared/blog/schema.ts'

const manifest: ImageManifest = {
  version: 1,
  images: {
    '/media/posts/covers/pipeline.webp': {
      hash: 'a'.repeat(64),
      width: 1200,
      height: 630,
      remoteUrl: 'https://cdn.example.com/posts/covers/pipeline.webp',
    },
  },
}

describe('image urls', () => {
  it('keeps the logical path in local mode', () => {
    expect(
      resolveImageUrl('/media/posts/covers/pipeline.webp', {
        mode: 'local',
        manifest,
        absolute: true,
        siteUrl: 'https://blog.example.com',
      }),
    ).toBe('https://blog.example.com/media/posts/covers/pipeline.webp')
  })

  it('passes through legacy https cover urls unchanged', () => {
    const url = 'https://s.muxui.com:8015/images/2026/09/sample.webp'
    expect(
      resolveImageUrl(url, {
        mode: 'local',
        manifest,
        absolute: true,
        siteUrl: 'https://blog.example.com',
      }),
    ).toBe(url)
  })

  it('uses the manifest in remote mode and rejects a missing mapping', () => {
    expect(
      resolveImageUrl('/media/posts/covers/pipeline.webp', {
        mode: 'remote',
        manifest,
      }),
    ).toBe('https://cdn.example.com/posts/covers/pipeline.webp')
    expect(() =>
      resolveImageUrl('/media/posts/missing.webp', {
        mode: 'remote',
        manifest,
      }),
    ).toThrow(/缺少映射/)
  })

  it('rejects external and traversal paths', () => {
    expect(() => assertSafeImagePath('https://evil.example/a.webp')).toThrow(/非法图片路径/)
    expect(() => assertSafeImagePath('/media/posts/../../secret.webp')).toThrow(/非法图片路径/)
  })

  it('skips an upload when the hash and remote url already match', () => {
    expect(shouldUpload(manifest.images['/media/posts/covers/pipeline.webp'], 'a'.repeat(64))).toBe(
      false,
    )
    expect(shouldUpload(manifest.images['/media/posts/covers/pipeline.webp'], 'b'.repeat(64))).toBe(
      true,
    )
  })

  it('replaces a manifest atomically', () => {
    const root = mkdtempSync(join(tmpdir(), 'blog-manifest-'))
    saveManifestAtomic(root, manifest)
    expect(
      JSON.parse(readFileSync(join(root, 'data', 'image-manifest.json'), 'utf8')).version,
    ).toBe(1)
    writeFileSync(join(root, 'data', 'image-manifest.json'), '{"version":1,"images":{}}\n')
    expect(
      JSON.parse(readFileSync(join(root, 'data', 'image-manifest.json'), 'utf8')).images,
    ).toEqual({})
  })

  it('builds the OSS string to sign', () => {
    expect(
      ossStringToSign('PUT', 'image/webp', 'Thu, 13 Nov 2026 00:00:00 GMT', 'blog', 'posts/a.webp'),
    ).toBe('PUT\n\nimage/webp\nThu, 13 Nov 2026 00:00:00 GMT\n/blog/posts/a.webp')
  })
})
