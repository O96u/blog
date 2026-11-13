<script setup lang="ts">
withDefaults(defineProps<{ id?: string }>(), { id: '' })
</script>

<template>
  <!-- The article title is the page's only h1; Markdown level-one headings are normalized to h2. -->
  <h2 :id="id" class="prose-heading prose-heading--h2">
    <a v-if="id" :href="`#${id}`"><slot /></a>
    <slot v-else />
  </h2>
</template>
