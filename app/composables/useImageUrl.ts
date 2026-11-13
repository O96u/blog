import manifest from '~~/data/image-manifest.json'
import { resolveImageUrl, type ImageMode } from '~~/shared/blog/images'
import type { ImageManifest } from '~~/shared/blog/schema'

export function useImageUrl() {
  const config = useRuntimeConfig()
  const site = useSiteConfig()
  const mode: ImageMode = config.public.imageMode === 'remote' ? 'remote' : 'local'
  const imageManifest = manifest as ImageManifest

  function url(input?: string, absolute = false) {
    if (!input) {
      return absolute ? new URL('/og/default.png', site.url).href : '/og/default.png'
    }
    return resolveImageUrl(input, {
      mode,
      manifest: imageManifest,
      absolute,
      siteUrl: site.url,
    })
  }

  return { url, mode }
}
