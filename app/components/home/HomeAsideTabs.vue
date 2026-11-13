<script setup lang="ts">
import type { BlogPost } from '~~/shared/blog/model'

defineProps<{
  posts: BlogPost[]
  tags: Array<{ slug: string; count: number }>
}>()

const tab = ref<'aggregate' | 'tags'>('aggregate')

function formatShortDate(date: string) {
  const [year, month, day] = date.split('-')
  if (!year || !month || !day) {
    return date
  }
  return `${year.slice(2)}年${Number(month)}月${Number(day)}日`
}
</script>

<template>
  <aside class="portal-side-card portal-side-card--tabs">
    <div class="home-aside-tabs" role="tablist" aria-label="侧栏分类">
      <button
        type="button"
        class="home-aside-tab"
        role="tab"
        :aria-selected="tab === 'aggregate'"
        :class="{ 'is-active': tab === 'aggregate' }"
        @click="tab = 'aggregate'"
      >
        文章聚合
      </button>
      <button
        type="button"
        class="home-aside-tab"
        role="tab"
        :aria-selected="tab === 'tags'"
        :class="{ 'is-active': tab === 'tags' }"
        @click="tab = 'tags'"
      >
        热门标签
      </button>
    </div>

    <div v-show="tab === 'aggregate'" class="home-aside-panel" role="tabpanel">
      <ol class="home-aggregate-list">
        <li v-for="(post, index) in posts" :key="post.path" class="home-aggregate-item">
          <span
            class="home-aggregate-rank"
            :class="{ 'home-aggregate-rank--top': index < 3 }"
            :data-rank="index + 1"
          >
            {{ index + 1 }}
          </span>
          <NuxtLink class="home-aggregate-link" :to="post.path">
            <span class="home-aggregate-title">{{ post.title }}</span>
            <time class="home-aggregate-date" :datetime="post.date">{{
              formatShortDate(post.date)
            }}</time>
          </NuxtLink>
        </li>
      </ol>
      <NuxtLink class="portal-text-link home-aggregate-more" to="/archives">查看归档</NuxtLink>
    </div>

    <div v-show="tab === 'tags'" class="home-aside-panel" role="tabpanel">
      <div class="portal-tag-cloud">
        <NuxtLink
          v-for="tag in tags"
          :key="tag.slug"
          class="portal-tag-chip"
          :to="`/tags/${tag.slug}`"
        >
          <span>{{ tag.slug }}</span>
          <span class="portal-tag-chip-count">{{ tag.count }}</span>
        </NuxtLink>
      </div>
      <NuxtLink class="portal-text-link home-aggregate-more" to="/tags">全部标签</NuxtLink>
    </div>
  </aside>
</template>
