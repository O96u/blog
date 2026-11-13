<script setup lang="ts">
defineProps<{
  postCount: number
  tagCount: number
  lastUpdated?: string
}>()
</script>

<template>
  <dl class="home-stats">
    <div class="home-stat">
      <dt>文章</dt>
      <dd>{{ postCount }}</dd>
    </div>
    <div class="home-stat">
      <dt>标签</dt>
      <dd>{{ tagCount }}</dd>
    </div>
    <div class="home-stat">
      <dt>最近更新</dt>
      <dd>
        <time v-if="lastUpdated" :datetime="lastUpdated">{{ lastUpdated }}</time>
        <span v-else>持续更新</span>
      </dd>
    </div>
  </dl>
</template>
