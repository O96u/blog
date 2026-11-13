import { seoDescription, seoTitle, type BlogPost } from '~~/shared/blog/model'

export function usePostSeo(post: BlogPost) {
  const site = useSiteConfig()
  const { url } = useImageUrl()
  const title = seoTitle(post)
  const description = seoDescription(post)
  const image = url(post.cover, true)
  const robots = post.draft || post.seo?.noindex ? 'noindex, nofollow' : undefined

  useSeoMeta({
    title,
    description,
    ogTitle: title,
    ogDescription: description,
    ogType: 'article',
    ogImage: image,
    twitterCard: 'summary_large_image',
    twitterTitle: title,
    twitterDescription: description,
    twitterImage: image,
    robots,
  })

  const pageUrl = new URL(post.path, site.url).href
  useHead({
    script: [
      {
        key: `blog-posting-${post.path}`,
        type: 'application/ld+json',
        innerHTML: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'BlogPosting',
          headline: title,
          description,
          datePublished: post.date,
          dateModified: post.updated || post.date,
          image,
          author: { '@type': 'Person', name: site.name },
          mainEntityOfPage: pageUrl,
        }),
      },
      {
        key: `breadcrumb-${post.path}`,
        type: 'application/ld+json',
        innerHTML: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: '首页', item: new URL('/', site.url).href },
            {
              '@type': 'ListItem',
              position: 2,
              name: '文章',
              item: new URL('/posts', site.url).href,
            },
            { '@type': 'ListItem', position: 3, name: title, item: pageUrl },
          ],
        }),
      },
    ],
  })
}
