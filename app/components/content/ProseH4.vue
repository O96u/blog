<script setup lang="ts">
withDefaults(defineProps<{ id?: string }>(), { id: '' })
</script>

<template>
  <h4 :id="id" class="prose-heading prose-heading--h4">
    <a v-if="id" :href="`#${id}`"><slot /></a>
    <slot v-else />
  </h4>
</template>
