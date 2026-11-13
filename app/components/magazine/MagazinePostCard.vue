<script setup lang="ts">
import type { BlogPost } from '~~/shared/blog/model'

const props = withDefaults(
  defineProps<{
    post: BlogPost
    layout?: 'grid' | 'side' | 'row'
  }>(),
  {
    layout: 'grid',
  },
)

const minutes = computed(() => minutesOf(props.post))
</script>

<template>
  <article
    class="mag-card group flex h-full flex-col overflow-hidden rounded-[var(--radius-cover)] border border-default bg-elevated motion-safe:hover:border-[color-mix(in_srgb,var(--ui-primary)_35%,var(--ui-border))]"
    :class="layout === 'row' ? 'sm:flex-row' : ''"
  >
    <NuxtLink
      class="block shrink-0 overflow-hidden"
      :class="layout === 'row' ? 'sm:w-52' : ''"
      :to="post.path"
      tabindex="-1"
      aria-hidden="true"
    >
      <PostCover :post="post" aspect="3/2" />
    </NuxtLink>
    <div class="flex flex-1 flex-col p-4 md:p-5">
      <p class="mag-meta flex flex-wrap items-center gap-2">
        <time :datetime="post.date">{{ post.date }}</time>
        <span aria-hidden="true">·</span>
        <span>{{ minutes }} 分钟</span>
        <span v-if="post.pinned" class="mag-pill">置顶</span>
      </p>
      <h2 class="mag-card-title mt-2">
        <NuxtLink class="mag-link" :to="post.path">{{ post.title }}</NuxtLink>
      </h2>
      <p class="mag-body mt-2 line-clamp-3 flex-1 text-muted">{{ post.description }}</p>
      <p v-if="post.tags.length" class="mag-tags mt-4">
        <NuxtLink
          v-for="tag in post.tags.slice(0, 3)"
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
