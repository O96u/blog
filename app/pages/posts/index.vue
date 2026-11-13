<script setup lang="ts">
import { postsListPageFromQuery } from '~~/shared/blog/model'

definePageMeta({
  key: 'posts-archive',
  keepalive: true,
})

const route = useRoute()
const page = computed(() => postsListPageFromQuery(route.query))
</script>

<template>
  <PostListPage :page="page" />
</template>
