<script setup lang="ts">
import type { BlogPost } from '~~/shared/blog/model'

const props = defineProps<{
  post: BlogPost
  compact?: boolean
}>()

const minutes = computed(() => minutesOf(props.post))
</script>

<template>
  <article
    class="mag-featured group flex h-full flex-col overflow-hidden rounded-lg border border-default bg-elevated"
    :class="compact ? '' : 'lg:min-h-[28rem]'"
  >
    <NuxtLink
      class="relative block overflow-hidden motion-safe:transition-transform motion-safe:duration-300 motion-safe:group-hover:scale-[1.02]"
      :to="post.path"
      tabindex="-1"
      aria-hidden="true"
    >
      <PostCover :post="post" :aspect="compact ? '16/9' : '3/2'" :featured="!compact" />
    </NuxtLink>
    <div class="flex flex-1 flex-col p-5 md:p-6">
      <p class="mag-meta flex flex-wrap items-center gap-2">
        <span v-if="post.pinned" class="mag-pill mag-pill--accent">精选</span>
        <time :datetime="post.date">{{ post.date }}</time>
        <span aria-hidden="true">·</span>
        <span>{{ minutes }} 分钟</span>
      </p>
      <h2 class="mt-3 font-display text-2xl font-semibold leading-tight tracking-tight md:text-3xl">
        <NuxtLink class="mag-link" :to="post.path">{{ post.title }}</NuxtLink>
      </h2>
      <p class="mag-body mt-3 text-muted" :class="compact ? 'line-clamp-2' : 'line-clamp-3'">
        {{ post.description }}
      </p>
      <p v-if="post.tags.length" class="mag-tags mt-auto pt-4">
        <NuxtLink
          v-for="tag in post.tags.slice(0, compact ? 2 : 4)"
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
