<script setup lang="ts">
const props = defineProps<{
  postCount: number
  tagCount: number
  lastUpdated?: string
  tags: Array<{ slug: string; count: number }>
}>()

const formattedUpdated = computed(() => {
  if (!props.lastUpdated) return '—'
  const [year, month, day] = props.lastUpdated.split('-')
  return year && month && day ? `${year}.${month}.${day}` : props.lastUpdated
})
</script>

<template>
  <section class="portal-side-card portal-side-card--overview" aria-labelledby="site-overview-title">
    <div class="portal-side-heading">
      <span class="portal-side-heading-mark" aria-hidden="true"></span>
      <h2 id="site-overview-title" class="portal-side-title">站点概览</h2>
    </div>

    <dl class="home-overview-stats">
      <div class="home-overview-stat">
        <dt>文章</dt>
        <dd>{{ postCount }}</dd>
      </div>
      <div class="home-overview-stat">
        <dt>标签</dt>
        <dd>{{ tagCount }}</dd>
      </div>
      <div class="home-overview-stat home-overview-stat--wide">
        <dt>最近更新</dt>
        <dd>{{ formattedUpdated }}</dd>
      </div>
    </dl>

    <div class="home-overview-tags">
      <p class="home-overview-label">热门标签</p>
      <div class="portal-tag-cloud">
        <NuxtLink
          v-for="tag in tags"
          :key="tag.slug"
          class="portal-tag-chip"
          :to="`/tags/${tag.slug}`"
        >
          <span>{{ tag.slug }}</span>
          <span class="portal-tag-chip-count">{{ tag.count }}</span>
        </NuxtLink>
      </div>
      <NuxtLink class="portal-text-link home-overview-more" to="/tags">查看全部标签 →</NuxtLink>
    </div>
  </section>
</template>
