<script setup lang="ts">
const props = withDefaults(defineProps<{
  type?: 'info' | 'warning' | 'tip' | 'danger'
  color?: string
}>(), {
  type: 'info',
  color: '',
})

const kind = computed(() => props.color || props.type)
</script>

<template>
  <aside class="callout" :data-type="kind">
    <slot />
  </aside>
</template>
