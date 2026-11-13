<script setup lang="ts">
import type { BlogPost } from '~~/shared/blog/model'
defineProps<{
  posts: BlogPost[]
  tags: Array<{ slug: string; count: number }>
  modelValue: string
  total: number
  hasMore: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
  'load-more': []
}>()

function selectTag(slug: string) {
  emit('update:modelValue', slug)
}
</script>

<template>
  <section class="home-feed" aria-label="最新文章列表">
    <header class="home-feed-head home-section-head home-section-head--split">
      <div>
        <p class="portal-eyebrow portal-eyebrow--subtle">列表</p>
        <h2 class="home-section-title mt-1">最新文章</h2>
        <p class="home-feed-note">共 {{ total }} 篇内容，可按标签筛选</p>
      </div>
      <NuxtLink class="portal-text-link home-section-action" to="/posts">全部文章</NuxtLink>
    </header>

    <div class="home-feed-filters" role="group" aria-label="文章标签筛选">
      <button
        type="button"
        class="home-feed-filter"
        :class="{ 'is-active': !modelValue }"
        :aria-pressed="!modelValue"
        @click="selectTag('')"
      >
        全部
      </button>
      <button
        v-for="tag in tags"
        :key="tag.slug"
        type="button"
        class="home-feed-filter"
        :class="{ 'is-active': modelValue === tag.slug }"
        :aria-pressed="modelValue === tag.slug"
        @click="selectTag(tag.slug)"
      >
        {{ tag.slug }}
        <span class="home-feed-filter-count">{{ tag.count }}</span>
      </button>
    </div>

    <div v-if="posts.length" class="home-compact-grid">
      <HomeCompactPostCard v-for="post in posts" :key="post.path" :post="post" />
    </div>
    <p v-else class="home-feed-empty text-muted">当前筛选下没有文章。</p>

    <div class="home-feed-more">
      <button
        v-if="hasMore"
        type="button"
        class="home-feed-more-button"
        @click="emit('load-more')"
      >
        <span>加载更多</span>
        <span aria-hidden="true">↓</span>
      </button>
      <NuxtLink v-else class="home-feed-all-link" to="/posts">
        已显示当前筛选的全部文章，前往文章列表
      </NuxtLink>
    </div>
  </section>
</template>
