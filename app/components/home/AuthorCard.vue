<script setup lang="ts">
const config = useRuntimeConfig()
const githubUrl = computed(() => String(config.public.githubUrl || '').trim())
</script>

<template>
  <aside class="portal-side-card portal-side-card--author">
    <div class="portal-author-head">
      <img
        class="portal-author-avatar"
        src="/media/site/author-avatar.svg"
        width="56"
        height="56"
        alt=""
        decoding="async"
      />
      <div class="portal-author-intro">
        <h2 class="portal-side-title">Muxui</h2>
        <p class="portal-side-body portal-side-body--tight">
          Nuxt 静态博客 · 前端工程与可复现构建。
        </p>
      </div>
    </div>
    <p class="portal-side-body">
      文章、标签与归档在构建期输出；正文图片走统一 local / remote 解析。
    </p>
    <div class="portal-author-actions">
      <NuxtLink class="portal-side-chip" to="/about">了解更多</NuxtLink>
      <a
        v-if="githubUrl"
        class="portal-side-chip"
        :href="githubUrl"
        rel="noopener noreferrer"
        target="_blank"
      >
        GitHub
      </a>
      <a class="portal-side-chip" href="/rss.xml">RSS</a>
    </div>
  </aside>
</template>
