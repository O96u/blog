<script setup lang="ts">
const props = defineProps<{
  code?: string
  language?: string
  filename?: string
  class?: string
}>()

const isMermaid = computed(() => props.language === 'mermaid')
const copied = ref(false)

async function copyCode() {
  if (!props.code) {
    return
  }
  await navigator.clipboard.writeText(props.code)
  copied.value = true
  track('copy-code', { language: props.language || 'text' })
  setTimeout(() => {
    copied.value = false
  }, 1600)
}
</script>

<template>
  <MermaidBlock v-if="isMermaid" :code="code || ''" />
  <div v-else class="code-block">
    <div class="code-block-toolbar">
      <span class="code-block-language">{{ filename || language || 'code' }}</span>
      <button type="button" class="code-block-copy" @click="copyCode">
        {{ copied ? '已复制' : '复制' }}
      </button>
    </div>
    <pre :class="props.class" :data-language="language || 'text'"><slot /></pre>
  </div>
</template>
