<script setup lang="ts">
import { postsListRouteLocation } from '~~/shared/blog/model'

const route = useRoute()
const page = Number(route.params.page)

if (!Number.isInteger(page) || page < 2) {
  await navigateTo('/posts', { redirectCode: 301 })
}

/** 浏览器里统一到 `/posts?page=N`，与列表内分页同一路由，避免整页重挂 */
if (import.meta.client) {
  onMounted(() => {
    const query = Object.fromEntries(
      Object.entries(route.query).map(([key, value]) => [
        key,
        Array.isArray(value) ? value[0] : value,
      ]),
    ) as Record<string, string | undefined>
    void navigateTo(postsListRouteLocation(page, query), { replace: true })
  })
}
</script>

<template>
  <PostListPage v-if="page >= 2" :page="page" />
</template>
