<script setup lang="ts">
defineProps<{
  tags: Array<{ slug: string; count: number }>
}>()
</script>

<template>
  <aside class="portal-side-card">
    <h2 class="portal-side-title">热门标签</h2>
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
  </aside>
</template>
