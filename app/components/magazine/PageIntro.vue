<script setup lang="ts">
defineProps<{
  eyebrow?: string
  title: string
  description?: string
}>()
</script>

<template>
  <header class="mag-page-intro">
    <p v-if="eyebrow" class="mag-eyebrow">{{ eyebrow }}</p>
    <div class="mag-page-intro-grid">
      <h1 class="mag-page-title">{{ title }}</h1>
      <p v-if="description" class="mag-page-lead">{{ description }}</p>
    </div>
  </header>
</template>
