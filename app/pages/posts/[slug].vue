<script setup lang="ts">
const route = useRoute()
const slug = computed(() => {
  const value = route.params.slug
  return Array.isArray(value) ? (value[0] ?? '') : String(value ?? '')
})

const { data: row } = await useAsyncData(
  () => `blog:post:${slug.value}`,
  () => queryCollection('posts').path(`/posts/${slug.value}`).first(),
)

const document = computed(() => {
  if (!row.value) {
    throw createError({ statusCode: 404, statusMessage: 'Article not found', fatal: true })
  }
  return row.value
})
const post = computed(() => normalizePost(document.value))
if (post.value.draft && !import.meta.dev) {
  throw createError({ statusCode: 404, statusMessage: 'Article not found', fatal: true })
}

const index = await useBlogIndex()
const current = post.value
const surroundings = surroundingsOf(index.posts, current.path)
const related = relatedOf(index.posts, current)
const minutes = minutesOf(current)
const tocLinks = computed(() => {
  const body = row.value?.body as
    | {
        toc?: {
          links?: Array<{
            id: string
            text: string
            children?: Array<{ id: string; text: string }>
          }>
        }
      }
    | undefined
  return current.toc ? (body?.toc?.links ?? []) : []
})

usePostSeo(current)
</script>

<template>
  <article v-if="post" class="prose-content">
    <ArticleBackToTop />
    <p
      v-if="post.draft"
      class="mb-4 rounded-lg border border-default bg-elevated px-3 py-2 text-sm"
    >
      这是草稿，只在开发环境可见。
    </p>
    <div class="mag-article-shell">
      <header class="mag-article-heading article-hero">
        <p class="mag-meta article-hero-kicker">
          <NuxtLink class="mag-link" to="/posts">文章</NuxtLink>
          <span aria-hidden="true">/</span>
          <span>{{ post.tags[0] || '技术笔记' }}</span>
        </p>
        <h1 class="article-hero-title">
          {{ post.title }}
        </h1>
        <p class="mag-meta article-hero-meta">
          <time :datetime="post.date">{{ post.date }}</time>
          <span v-if="post.updated">· 更新于 {{ post.updated }}</span>
          <span>· {{ minutes }} 分钟</span>
        </p>
        <p v-if="post.tags.length" class="mag-tags mt-4">
          <NuxtLink v-for="tag in post.tags" :key="tag" class="mag-tag" :to="`/tags/${tag}`">{{
            tag
          }}</NuxtLink>
        </p>
      </header>
      <div class="mag-article-cover mt-8 overflow-hidden rounded-lg border border-default">
        <PostCover :post="post" aspect="16/9" featured />
      </div>
      <div class="mag-article-grid mt-10">
        <div class="mag-article-prose min-w-0">
          <ContentRenderer :value="document" />
        </div>
        <aside v-if="tocLinks.length" class="mag-article-toc mt-8 lg:mt-2">
          <details class="rounded-lg border border-default bg-elevated p-4 lg:hidden">
            <summary class="cursor-pointer font-semibold">目录</summary>
            <TocList :links="tocLinks" />
          </details>
          <nav
            class="mag-article-toc-nav hidden lg:block"
            aria-label="目录"
          >
            <p class="mag-eyebrow">文章目录</p>
            <TocList :links="tocLinks" />
          </nav>
        </aside>
      </div>
      <div class="mag-article-bottom">
        <nav
          class="mt-12 grid gap-3 border-t border-default pt-8 sm:grid-cols-2"
          aria-label="相邻文章"
        >
          <NuxtLink
            v-if="surroundings.previous"
            class="mag-btn justify-start"
            :to="surroundings.previous.path"
          >
            上一篇：{{ surroundings.previous.title }}
          </NuxtLink>
          <NuxtLink
            v-if="surroundings.next"
            class="mag-btn justify-start sm:justify-self-end"
            :to="surroundings.next.path"
          >
            下一篇：{{ surroundings.next.title }}
          </NuxtLink>
        </nav>
        <section v-if="related.length" class="article-related mt-14" aria-label="相关文章">
          <div class="article-related-head">
            <div>
              <p class="mag-eyebrow">Related</p>
              <h2 class="mag-section-title mt-2">相关文章</h2>
            </div>
            <NuxtLink class="portal-text-link" to="/posts">全部文章</NuxtLink>
          </div>
          <ol class="article-related-grid">
            <li v-for="(item, index) in related" :key="item.path">
              <NuxtLink class="article-related-link" :to="item.path">
                <span class="article-related-index">{{ index + 1 }}</span>
                <span class="article-related-copy">
                  <strong>{{ item.title }}</strong>
                  <span>{{ item.description }}</span>
                </span>
                <span class="article-related-arrow" aria-hidden="true">→</span>
              </NuxtLink>
            </li>
          </ol>
        </section>
        <CommentThread :path="post.path" :enabled="post.comments && !post.draft" />
      </div>
    </div>
  </article>
</template>
