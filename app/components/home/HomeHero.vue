<script setup lang="ts">
defineProps<{
  postCount: number
  tagCount: number
  lastUpdated?: string
}>()
</script>

<template>
  <section class="home-hero" aria-label="首页导读">
    <div class="home-hero-grid">
      <div class="home-hero-copy">
        <p class="portal-eyebrow">Personal Tech Blog</p>
        <h1 class="home-hero-title">写代码，也记录思考。</h1>
        <p class="home-hero-lead">
          静态输出的个人技术博客：Markdown 正文、统一图片解析与可复现的构建流程。关注
          Nuxt、前端工程与站点治理实践。
        </p>
        <div class="home-hero-actions">
          <NuxtLink class="portal-btn portal-btn--primary" to="/posts">阅读文章</NuxtLink>
          <a class="portal-btn" href="/rss.xml">RSS</a>
        </div>
        <HomeStats
          class="mt-8"
          :post-count="postCount"
          :tag-count="tagCount"
          :last-updated="lastUpdated"
        />
      </div>
      <div class="home-hero-visual">
        <div class="home-hero-frame">
          <img
            class="home-hero-image"
            src="/media/site/hero-brand-desk.svg"
            width="1280"
            height="720"
            alt=""
            decoding="async"
            fetchpriority="high"
          />
        </div>
      </div>
    </div>
  </section>
</template>
