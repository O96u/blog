<script setup lang="ts">
import type { BlogPost } from '~~/shared/blog/model'

const props = defineProps<{
  post: BlogPost
}>()

const minutes = computed(() => minutesOf(props.post))
const category = computed(() => props.post.tags[0] ?? 'note')
</script>

<template>
  <article class="portal-card portal-card--lift home-compact-card group">
    <NuxtLink class="home-compact-link" :to="post.path">
      <div class="home-compact-media">
        <PostCover :post="post" aspect="3/2" display-mode="visual" />
      </div>
      <div class="home-compact-body">
        <p v-if="category" class="home-feed-cat">{{ category }}</p>
        <h3 class="home-compact-title">{{ post.title }}</h3>
        <p class="home-compact-desc">{{ post.description }}</p>
        <p class="home-compact-foot portal-meta">
          <img
            class="home-compact-avatar"
            src="/media/site/author-avatar.svg"
            width="20"
            height="20"
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
