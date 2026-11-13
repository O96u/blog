<script setup lang="ts">
import type { BlogPost } from '~~/shared/blog/model'
import type { HomeTopic } from '~~/shared/blog/home-portal'

defineProps<{
  items: Array<{ topic: HomeTopic; posts: BlogPost[] }>
}>()
</script>

<template>
  <section v-if="items.length" class="home-section" aria-labelledby="home-topics-title">
    <header class="home-section-head home-section-head--split">
      <div>
        <p class="portal-eyebrow">Topics</p>
        <h2 id="home-topics-title" class="home-section-title">技术专题</h2>
      </div>
      <NuxtLink class="portal-text-link home-section-action" to="/tags">全部标签</NuxtLink>
    </header>
    <div class="home-topic-grid">
      <article
        v-for="{ topic, posts } in items"
        :key="topic.id"
        class="portal-card portal-card--lift home-topic-card"
        :class="`home-topic-card--${topic.id}`"
      >
        <div class="home-topic-visual" aria-hidden="true">
          <span class="home-topic-badge">{{ posts.length }} 篇</span>
        </div>
        <h3 class="home-topic-title">{{ topic.title }}</h3>
        <p class="home-topic-desc">{{ topic.description }}</p>
        <ul class="home-topic-links">
          <li v-for="post in posts" :key="post.path">
            <NuxtLink class="home-topic-article-link" :to="post.path">{{ post.title }}</NuxtLink>
          </li>
        </ul>
      </article>
    </div>
  </section>
</template>
