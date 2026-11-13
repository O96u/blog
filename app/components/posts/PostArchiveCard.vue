<script setup lang="ts">
import type { BlogPost } from '~~/shared/blog/model'

const props = defineProps<{
  post: BlogPost
}>()

const category = computed(() => props.post.tags[0] ?? 'note')
</script>

<template>
  <article class="portal-card portal-card--lift posts-archive-card group">
    <NuxtLink class="posts-archive-cover" :to="post.path" tabindex="-1" aria-hidden="true">
      <PostCover :post="post" aspect="16/9" />
    </NuxtLink>
    <div class="posts-archive-body">
      <h2 class="posts-archive-title">
        <NuxtLink class="posts-archive-link" :to="post.path">{{ post.title }}</NuxtLink>
      </h2>
      <p class="posts-archive-meta">
        <time :datetime="post.date">{{ post.date }}</time>
        <span aria-hidden="true">·</span>
        <NuxtLink class="posts-archive-cat" :to="`/tags/${category}`">{{ category }}</NuxtLink>
        <span v-if="post.pinned" class="posts-archive-pinned">置顶</span>
      </p>
      <p v-if="post.tags.length" class="posts-archive-tagline">
        <template v-for="(tag, index) in post.tags.slice(0, 5)" :key="tag">
          <span v-if="index > 0" aria-hidden="true"> · </span>
          <NuxtLink class="posts-archive-tag" :to="`/tags/${tag}`">{{ tag }}</NuxtLink>
        </template>
      </p>
    </div>
  </article>
</template>
