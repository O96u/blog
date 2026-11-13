<script setup lang="ts">
import type { BlogPost } from '~~/shared/blog/model'

defineProps<{
  post: BlogPost
}>()
</script>

<template>
  <MagazinePostCard :post="post" layout="row" />
</template>
