import { canonicalUrl, isIndexable, seoDescription, seoTitle, sortChronological } from './model.ts'
import { imageModeFromEnv, resolveImageUrl } from './images.ts'
import { loadManifest } from './image-store.ts'
import type { SourcePost } from './source.ts'
import { DEFAULT_SITE_URL, SITE_DESCRIPTION, SITE_NAME } from './site-meta.ts'

export { DEFAULT_SITE_URL, SITE_DESCRIPTION, SITE_NAME }

export function siteUrl() {
  return (process.env.NUXT_SITE_URL || DEFAULT_SITE_URL).replace(/\/$/, '')
}

function escapeXml(value: string) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
}

export function renderRss(posts: SourcePost[]) {
  const origin = siteUrl()
  const manifest = loadManifest(process.cwd())
  const mode = imageModeFromEnv()
  const items = sortChronological(posts.filter(isIndexable))
    .map((post) => {
      const link = canonicalUrl(post.path, origin)
      const cover = post.cover
        ? resolveImageUrl(post.cover, { mode, manifest, absolute: true, siteUrl: origin })
        : ''
      const enclosure = cover ? `<enclosure url="${escapeXml(cover)}" type="image/webp" />` : ''
      const published = new Date(`${post.date}T12:00:00Z`).toUTCString()
      return `<item>
      <title>${escapeXml(seoTitle(post))}</title>
      <link>${escapeXml(link)}</link>
      <guid isPermaLink="true">${escapeXml(link)}</guid>
      <pubDate>${published}</pubDate>
      <description>${escapeXml(seoDescription(post))}</description>
      ${enclosure}
    </item>`
    })
    .join('\n')

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>${escapeXml(SITE_NAME)}</title>
    <link>${escapeXml(origin)}</link>
    <description>${escapeXml(SITE_DESCRIPTION)}</description>
    <language>zh-CN</language>
    ${items}
  </channel>
</rss>
`
}

export function renderSearchIndex(posts: SourcePost[]) {
  const documents = sortChronological(
    posts.filter((post) => post.draft === false && post.searchable),
  ).map((post) => ({
    id: post.path,
    path: post.path,
    title: post.title,
    description: post.description,
    tags: post.tags.join(' '),
    body: post.body,
  }))
  return `${JSON.stringify({ version: 1, documents }, null, 2)}\n`
}
