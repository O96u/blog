<script setup lang="ts">
useSeoMeta({
  title: '搜索',
  description: '站内文章搜索',
  robots: 'noindex, nofollow',
})
</script>

<template>
  <section>
    <MagazinePageIntro eyebrow="Search" title="搜索" description="查找已发布文章。支持中文与英文关键词。" />
    <div class="mt-2 rounded-xl border border-default bg-elevated p-4 md:p-6">
      <SearchPanel />
    </div>
  </section>
</template>
