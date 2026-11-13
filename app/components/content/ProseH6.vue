<script setup lang="ts">
withDefaults(defineProps<{ id?: string }>(), { id: '' })
</script>

<template>
  <h6 :id="id" class="prose-heading prose-heading--h6">
    <a v-if="id" :href="`#${id}`"><slot /></a>
    <slot v-else />
  </h6>
</template>
