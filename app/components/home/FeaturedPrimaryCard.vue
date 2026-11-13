<script setup lang="ts">
import type { BlogPost } from '~~/shared/blog/model'

const props = defineProps<{
  post: BlogPost
}>()

const minutes = computed(() => minutesOf(props.post))
const category = computed(() => props.post.tags[0] ?? 'feature')
</script>

<template>
  <article class="portal-card portal-card--lift home-featured-primary group overflow-hidden">
    <NuxtLink class="home-featured-primary-link" :to="post.path">
      <div class="home-featured-primary-media">
        <PostCover :post="post" aspect="16/9" display-mode="visual" featured />
      </div>
      <div class="home-featured-primary-overlay">
        <p class="home-cat-line home-cat-line--light">
          <span class="home-cat-bar" aria-hidden="true" />
          {{ category }}
          <span v-if="post.pinned" class="home-cat-pinned">置顶</span>
        </p>
        <h3 class="home-featured-primary-title">{{ post.title }}</h3>
        <p class="home-featured-primary-desc">{{ post.description }}</p>
        <p class="home-featured-foot home-featured-foot--light">
          <img
            class="home-featured-foot-avatar"
            src="/media/site/author-avatar.svg"
            width="24"
            height="24"
            alt=""
            decoding="async"
          />
          <span>Muxui</span>
          <span aria-hidden="true">·</span>
          <time :datetime="post.date">{{ post.date }}</time>
          <span aria-hidden="true">·</span>
          <span>{{ minutes }} 分钟</span>
        </p>
      </div>
    </NuxtLink>
  </article>
</template>
