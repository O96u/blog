<script setup lang="ts">
withDefaults(defineProps<{ id?: string }>(), { id: '' })
</script>

<template>
  <h5 :id="id" class="prose-heading prose-heading--h5">
    <a v-if="id" :href="`#${id}`"><slot /></a>
    <slot v-else />
  </h5>
</template>
