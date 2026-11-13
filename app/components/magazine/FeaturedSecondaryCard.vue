<script setup lang="ts">
import type { BlogPost } from '~~/shared/blog/model'

const props = defineProps<{
  post: BlogPost
}>()

const minutes = computed(() => minutesOf(props.post))
const category = computed(() => props.post.tags[0] ?? 'story')
</script>

<template>
  <article
    class="mag-pick-secondary group flex flex-1 flex-col overflow-hidden rounded-[var(--radius-cover)] border border-default bg-elevated sm:flex-row"
  >
    <NuxtLink
      class="mag-pick-secondary-media block shrink-0 overflow-hidden sm:w-[42%]"
      :to="post.path"
      tabindex="-1"
      aria-hidden="true"
    >
      <PostCover :post="post" aspect="3/2" />
    </NuxtLink>
    <div class="flex flex-1 flex-col justify-center p-5">
      <p class="mag-meta flex flex-wrap items-center gap-2">
        <span class="mag-pill">{{ category }}</span>
        <time :datetime="post.date">{{ post.date }}</time>
        <span aria-hidden="true">·</span>
        <span>{{ minutes }} 分钟</span>
      </p>
      <h3 class="mag-featured-secondary-title mt-3">
        <NuxtLink class="mag-link" :to="post.path">{{ post.title }}</NuxtLink>
      </h3>
      <p class="mag-body mt-2 line-clamp-2 text-muted">{{ post.description }}</p>
    </div>
  </article>
</template>
