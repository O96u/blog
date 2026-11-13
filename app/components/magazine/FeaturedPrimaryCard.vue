<script setup lang="ts">
import type { BlogPost } from '~~/shared/blog/model'

const props = defineProps<{
  post: BlogPost
}>()

const minutes = computed(() => minutesOf(props.post))
const category = computed(() => props.post.tags[0] ?? 'feature')
</script>

<template>
  <article
    class="mag-pick-primary group flex h-full flex-col overflow-hidden rounded-[var(--radius-cover)] border border-default bg-elevated"
  >
    <NuxtLink class="mag-pick-media" :to="post.path" tabindex="-1" aria-hidden="true">
      <PostCover :post="post" aspect="3/2" featured />
    </NuxtLink>
    <div class="flex flex-1 flex-col p-6 md:p-7">
      <p class="mag-meta flex flex-wrap items-center gap-2">
        <span class="mag-pill mag-pill--accent">{{ category }}</span>
        <span v-if="post.pinned" class="mag-pill">置顶</span>
        <time :datetime="post.date">{{ post.date }}</time>
        <span aria-hidden="true">·</span>
        <span>{{ minutes }} 分钟</span>
      </p>
      <h3 class="mag-featured-primary-title mt-4">
        <NuxtLink class="mag-link" :to="post.path">{{ post.title }}</NuxtLink>
      </h3>
      <p class="mag-body mt-3 line-clamp-3 text-muted">{{ post.description }}</p>
      <p v-if="post.tags.length" class="mag-tags mt-auto pt-5">
        <NuxtLink
          v-for="tag in post.tags.slice(0, 4)"
          :key="tag"
          class="mag-tag"
          :to="`/tags/${tag}`"
        >
          {{ tag }}
        </NuxtLink>
      </p>
    </div>
  </article>
</template>
