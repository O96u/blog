<script setup lang="ts">
withDefaults(
  defineProps<{
    id?: string
  }>(),
  { id: '' },
)
</script>

<template>
  <h2 :id="id" class="prose-heading prose-heading--h2">
    <a
      v-if="id"
      :href="`#${id}`"
      class="prose-heading-link group"
    >
      <span
        class="prose-heading-anchor"
        aria-hidden="true"
      >#</span>
      <slot />
    </a>
    <slot v-else />
  </h2>
</template>
