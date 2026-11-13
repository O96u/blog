<script setup lang="ts">
import type { BlogPost } from '~~/shared/blog/model'

defineProps<{
  posts: BlogPost[]
}>()

function formatShortDate(date: string) {
  const [year, month, day] = date.split('-')
  if (!year || !month || !day) {
    return date
  }
  return `${year.slice(2)}年${Number(month)}月${Number(day)}日`
}
</script>

<template>
  <aside class="portal-side-card portal-side-card--aggregate">
    <h2 class="portal-side-title">文章聚合</h2>
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
  </aside>
</template>
