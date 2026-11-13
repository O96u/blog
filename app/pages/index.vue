<script setup lang="ts">
import type { BlogPost } from '~~/shared/blog/model'
import { collectTagNames, getPostsByTag } from '~~/shared/blog/model'
import { HOME_FEED_PAGE_SIZE, homeTopicsWithPosts } from '~~/shared/blog/home-portal'

definePageMeta({ keepalive: true })

const index = await useBlogIndex()

const featuredLead = computed(() => index.pinned[0] ?? index.chronological[0])
const featuredSide = computed(() => {
  const lead = featuredLead.value
  if (!lead) {
    return []
  }
  const results: BlogPost[] = []
  for (const post of [...index.pinned.slice(1), ...index.chronological]) {
    if (post.path === lead.path || results.some((item) => item.path === post.path)) {
      continue
    }
    results.push(post)
    if (results.length === 2) {
      break
    }
  }
  return results
})

const featuredPaths = computed(
  () =>
    new Set(
      [featuredLead.value, ...featuredSide.value]
        .filter((post): post is BlogPost => Boolean(post))
        .map((post) => post.path),
    ),
)

const popularTags = computed(() => collectTagNames(index.published).slice(0, 8))
const aggregatePosts = computed(() => index.chronological.slice(0, 5))
const topicSections = computed(() => homeTopicsWithPosts(index.chronological))

const lastUpdated = computed(() => index.chronological[0]?.date)

const selectedTag = ref('')
const visiblePostCount = ref(HOME_FEED_PAGE_SIZE)

const feedSource = computed(() => {
  const base = index.chronological.filter((post) => !featuredPaths.value.has(post.path))
  if (!selectedTag.value) {
    return base
  }
  return getPostsByTag(base, selectedTag.value)
})

const visibleFeedPosts = computed(() => feedSource.value.slice(0, visiblePostCount.value))
const hasMoreFeedPosts = computed(() => visiblePostCount.value < feedSource.value.length)

watch(selectedTag, () => {
  visiblePostCount.value = HOME_FEED_PAGE_SIZE
})

function loadMorePosts() {
  visiblePostCount.value += HOME_FEED_PAGE_SIZE
}

useSeoMeta({
  title: '首页',
  description: 'Nuxt、Vue 与工程实践笔记',
})
</script>

<template>
  <div class="home-portal">
    <HomeHero
      :post-count="index.published.length"
      :tag-count="collectTagNames(index.published).length"
      :last-updated="lastUpdated"
    />
    <HomeFeaturedStories :lead="featuredLead" :side="featuredSide" />

    <section class="home-section" aria-label="文章与侧栏">
      <div class="home-feed-layout">
        <HomePostFeed
          v-model="selectedTag"
          :posts="visibleFeedPosts"
          :tags="popularTags"
          :total="feedSource.length"
          :has-more="hasMoreFeedPosts"
          @load-more="loadMorePosts"
        />
        <aside class="home-feed-aside" aria-label="侧栏">
          <HomeAuthorCard />
          <HomeSiteOverview
            :post-count="index.published.length"
            :tag-count="collectTagNames(index.published).length"
            :last-updated="lastUpdated"
            :tags="popularTags.slice(0, 6)"
          />
          <HomePostAggregate :posts="aggregatePosts" />
        </aside>
      </div>
    </section>

    <HomeTopicGrid :items="topicSections" />
  </div>
</template>
