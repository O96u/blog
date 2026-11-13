<script setup lang="ts">
definePageMeta({ keepalive: true })

useSeoMeta({
  title: '关于',
  description: '关于这座静态技术博客',
})
</script>

<template>
  <section class="max-w-3xl">
    <MagazinePageIntro
      eyebrow="About"
      title="关于"
      description="静态技术博客：Markdown 正文、统一图片解析、构建时输出归档与索引。"
    />
    <div class="space-y-4 rounded-xl border border-default bg-elevated p-6 md:p-8">
      <p class="mag-body">
        这里用 Nuxt 静态生成文章、标签、归档、RSS 和 sitemap。正文来自
        Markdown，图片地址通过统一解析器在本地和图床之间切换。
      </p>
      <p class="mag-body text-muted">新文章默认是草稿。生产构建不会收录草稿正文。</p>
    </div>
  </section>
</template>
