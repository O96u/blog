<script setup lang="ts">
import { collectTagNames } from '~~/shared/blog/model'

definePageMeta({ keepalive: true })

const index = await useBlogIndex()
const tags = collectTagNames(index.published)

useSeoMeta({
  title: '标签',
  description: '按标签浏览文章',
})
</script>

<template>
  <section>
    <MagazinePageIntro
      eyebrow="Topics"
      title="标签"
      description="标签是文章主题索引。从高频关键词进入全站内容脉络。"
    />
    <nav class="mag-tag-index mt-4" aria-label="标签索引">
      <NuxtLink v-for="tag in tags" :key="tag.slug" :to="`/tags/${tag.slug}`">
        <span>#{{ tag.slug }}</span>
        <span class="mag-tag-index-count">{{ tag.count }}</span>
      </NuxtLink>
    </nav>
  </section>
</template>
