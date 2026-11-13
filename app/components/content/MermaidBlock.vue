<script setup lang="ts">
defineProps<{
  code: string
}>()
</script>

<template>
  <figure class="mermaid-figure" data-mermaid="true" aria-label="Mermaid 图表">
    <ClientOnly>
      <MermaidCanvas :code="code" />
      <template #fallback>
        <pre class="mermaid">{{ code }}</pre>
      </template>
    </ClientOnly>
  </figure>
</template>
