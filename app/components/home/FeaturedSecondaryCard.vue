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
    class="portal-card portal-card--lift home-featured-secondary home-featured-secondary--overlay group overflow-hidden"
  >
    <NuxtLink
      class="home-featured-secondary-link home-featured-secondary-link--overlay"
      :to="post.path"
    >
      <div class="home-featured-secondary-media home-featured-secondary-media--cover">
        <PostCover :post="post" aspect="3/2" display-mode="visual" />
      </div>
      <div class="home-featured-secondary-overlay">
        <p class="home-cat-line">
          <span class="home-cat-bar" aria-hidden="true" />
          {{ category }}
        </p>
        <h3 class="home-featured-secondary-title">{{ post.title }}</h3>
        <p class="home-featured-foot">
          <img
            class="home-featured-foot-avatar"
            src="/media/site/author-avatar.svg"
            width="22"
            height="22"
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
