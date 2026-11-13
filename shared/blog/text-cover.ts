export const TEXT_COVER_VARIANT_COUNT = 6

export function postSlugFromPath(path: string) {
  const match = path.match(/\/posts\/([^/]+)$/)
  return match?.[1] ?? path
}

export function textCoverVariant(slug: string) {
  let hash = 2166136261
  for (let index = 0; index < slug.length; index += 1) {
    hash ^= slug.charCodeAt(index)
    hash = Math.imul(hash, 16777619)
  }
  return Math.abs(hash) % TEXT_COVER_VARIANT_COUNT
}

export function textCoverLabel(post: { tags: string[]; title: string; tech?: string[] }) {
  if (post.tech?.length) {
    return post.tech[0]
  }
  if (post.tags.length) {
    return post.tags[0]
  }
  return 'Tech'
}

export function textCoverSnippet(slug: string) {
  const token = slug.replace(/[^a-z0-9]/gi, '_').slice(0, 18) || 'post'
  return [`const ${token} = await $fetch`, 'export default definePage', '// magazine cover']
}
