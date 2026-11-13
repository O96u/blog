<script setup lang="ts">
import type { BlogPost } from '~~/shared/blog/model'

defineProps<{
  lead?: BlogPost
  side: BlogPost[]
}>()
</script>

<template>
  <section v-if="lead" class="home-section" aria-labelledby="featured-stories-title">
    <header class="home-section-head">
      <div>
        <p class="portal-eyebrow">Featured</p>
        <h2 id="featured-stories-title" class="home-section-title">精选推荐</h2>
      </div>
    </header>
    <div
      class="home-featured-grid"
      :class="{
        'home-featured-grid--lead-only': side.length === 0,
        'home-featured-grid--single-side': side.length === 1,
      }"
    >
      <HomeFeaturedPrimaryCard class="home-featured-lead" :post="lead" />
      <div v-if="side.length" class="home-featured-side">
        <HomeFeaturedSecondaryCard v-for="post in side" :key="post.path" :post="post" />
      </div>
    </div>
  </section>
</template>
