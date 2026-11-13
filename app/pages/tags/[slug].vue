<script setup lang="ts">
const route = useRoute()
const slug = computed(() => String(route.params.slug ?? ''))
const index = await useBlogIndex()
const posts = computed(() => postsByTag(index.posts, slug.value))

if (!/^[a-z0-9-]+$/.test(slug.value) || posts.value.length === 0) {
  throw createError({ statusCode: 404, statusMessage: 'Tag not found', fatal: true })
}

useSeoMeta({
  title: `标签 ${slug.value}`,
  description: `标签 ${slug.value} 下的文章`,
})
</script>

<template>
  <section>
    <MagazinePageIntro
      eyebrow="Topic"
      :title="`#${slug}`"
      :description="`共 ${posts.length} 篇与「${slug}」相关的文章。`"
    />
    <div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      <MagazinePostCard v-for="post in posts" :key="post.path" :post="post" />
    </div>
  </section>
</template>
