<script setup lang="ts">
import {
  postSlugFromPath,
  textCoverLabel,
  textCoverSnippet,
  textCoverVariant,
} from '~~/shared/blog/text-cover'

const props = withDefaults(
  defineProps<{
    title: string
    path: string
    tags?: string[]
    tech?: string[]
    aspect?: '3/2' | '16/9'
    featured?: boolean
    displayMode?: 'visual' | 'poster'
  }>(),
  {
    tags: () => [],
    tech: () => [],
    aspect: '3/2',
    featured: false,
    displayMode: 'poster',
  },
)

const slug = computed(() => postSlugFromPath(props.path))
const variant = computed(() => textCoverVariant(slug.value))
const label = computed(() =>
  textCoverLabel({ tags: props.tags, title: props.title, tech: props.tech }),
)
const snippet = computed(() => textCoverSnippet(slug.value))
</script>

<template>
  <div
    class="text-cover"
    :data-mode="displayMode"
    :class="[`text-cover-v${variant}`, props.aspect === '16/9' ? 'aspect-video' : 'aspect-[3/2]']"
    role="img"
    :aria-label="`${title} 文字封面`"
  >
    <div class="text-cover-pattern" aria-hidden="true" />
    <ul v-if="variant === 2 || variant === 5" class="text-cover-code" aria-hidden="true">
      <li v-for="line in snippet" :key="line">{{ line }}</li>
    </ul>
    <div v-if="displayMode === 'poster'" class="text-cover-copy">
      <p class="text-cover-kicker type-caption">{{ label }}</p>
      <p class="text-cover-title" :class="featured ? 'text-cover-title--lg' : ''">{{ title }}</p>
    </div>
    <div v-else class="text-cover-art" aria-hidden="true">
      <span class="text-cover-art-orbit" />
      <span class="text-cover-art-label">{{ label }}</span>
      <span class="text-cover-art-mark">/ {{ slug.slice(0, 2).toUpperCase() }}</span>
    </div>
  </div>
</template>
