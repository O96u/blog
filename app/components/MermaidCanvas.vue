<script setup lang="ts">
const props = defineProps<{
  code: string
}>()

const host = ref<HTMLElement | null>(null)
const failed = ref(false)

onMounted(async () => {
  if (!host.value) {
    failed.value = true
    return
  }
  try {
    const mermaid = (await import('mermaid')).default
    mermaid.initialize({
      startOnLoad: false,
      securityLevel: 'strict',
      theme: document.documentElement.classList.contains('dark') ? 'dark' : 'neutral',
      fontFamily: 'inherit',
    })
    const id = `mmd${Math.random().toString(36).slice(2)}`
    const { svg } = await mermaid.render(id, props.code.trim())
    host.value.innerHTML = svg
  } catch {
    failed.value = true
  }
})
</script>

<template>
  <div>
    <div ref="host" />
    <p v-if="failed" class="text-red-700">图表渲染失败</p>
  </div>
</template>
