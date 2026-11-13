<script setup lang="ts">
definePageMeta({ keepalive: true })

const index = await useBlogIndex()

useSeoMeta({
  title: '归档',
  description: '按年份排列的已发布文章',
})
</script>

<template>
  <section>
    <MagazinePageIntro
      eyebrow="Archives"
      title="归档"
      description="按时间回溯全部已发布文章，年份与日期分层展示。"
    />
    <section
      v-for="group in index.archives"
      :key="group.year"
      class="mt-12 border-t border-default pt-10 first:mt-0 first:border-t-0 first:pt-0"
    >
      <div class="mag-grid-12 items-start">
        <aside class="col-span-12 md:col-span-2">
          <p class="mag-archive-year">{{ group.year }}</p>
          <p class="mag-meta mt-1">{{ group.posts.length }} 篇</p>
        </aside>
        <ol class="col-span-12 space-y-8 md:col-span-10">
          <li
            v-for="post in group.posts"
            :key="post.path"
            class="mag-grid-12 items-start gap-y-3 border-b border-default pb-8 last:border-b-0"
          >
            <div class="col-span-12 md:col-span-2">
              <p class="mag-archive-day">{{ post.date.slice(8, 10) }}</p>
              <p class="mag-meta mt-1 uppercase">{{ post.date.slice(5, 7) }}</p>
            </div>
            <article class="col-span-12 md:col-span-10">
              <h2 class="text-xl font-semibold leading-snug md:text-2xl">
                <NuxtLink class="mag-link" :to="post.path">{{ post.title }}</NuxtLink>
              </h2>
              <p class="mag-body mt-2 text-muted">{{ post.description }}</p>
              <p v-if="post.tags.length" class="mag-tags mt-3">
                <NuxtLink
                  v-for="tag in post.tags.slice(0, 4)"
                  :key="tag"
                  class="mag-tag"
                  :to="`/tags/${tag}`"
                >
                  {{ tag }}
                </NuxtLink>
              </p>
            </article>
          </li>
        </ol>
      </div>
    </section>
  </section>
</template>
