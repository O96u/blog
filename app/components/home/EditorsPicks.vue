<script setup lang="ts">
import type { BlogPost } from '~~/shared/blog/model'

defineProps<{
  lead?: BlogPost
  side: BlogPost[]
}>()
</script>

<template>
  <section v-if="lead" class="mag-home-section" aria-labelledby="editors-picks-title">
    <header class="mag-section-head">
      <div>
        <p class="mag-eyebrow">Editor&apos;s Picks</p>
        <h2 id="editors-picks-title" class="mag-section-title mt-2">本期精选</h2>
      </div>
      <p class="mag-section-note">置顶优先，余量由最新文章补足。</p>
    </header>
    <div class="mag-picks-grid">
      <MagazineFeaturedPrimaryCard class="mag-picks-primary" :post="lead" />
      <div class="mag-picks-side">
        <MagazineFeaturedSecondaryCard v-for="post in side" :key="post.path" :post="post" />
      </div>
    </div>
  </section>
</template>
