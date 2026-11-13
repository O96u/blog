<script setup lang="ts">
import type { BlogPost } from '~~/shared/blog/model'

defineProps<{
  posts: BlogPost[]
}>()
</script>

<template>
  <aside class="portal-side-card">
    <h2 class="portal-side-title">近期更新</h2>
    <ol class="portal-timeline">
      <li v-for="post in posts" :key="post.path" class="portal-timeline-item">
        <NuxtLink class="portal-timeline-link" :to="post.path">
          <time class="portal-timeline-date" :datetime="post.date">{{ post.date }}</time>
          <span class="portal-timeline-title">{{ post.title }}</span>
        </NuxtLink>
      </li>
    </ol>
  </aside>
</template>
