<script setup lang="ts">
import type { BlogPost } from '~~/shared/blog/model'

withDefaults(
  defineProps<{
    post: Pick<BlogPost, 'path' | 'title' | 'cover' | 'tags' | 'tech'>
    aspect?: '3/2' | '16/9'
    featured?: boolean
    displayMode?: 'visual' | 'poster'
  }>(),
  {
    aspect: '3/2',
    featured: false,
    displayMode: 'poster',
  },
)

const { url } = useImageUrl()
</script>

<template>
  <img
    v-if="post.cover"
    :src="url(post.cover)"
    :alt="post.title"
    class="h-full w-full rounded-lg object-cover"
    loading="lazy"
  />
  <TextCover
    v-else
    :title="post.title"
    :path="post.path"
    :tags="post.tags"
    :tech="post.tech"
    :aspect="aspect"
    :featured="featured"
    :display-mode="displayMode"
  />
</template>
