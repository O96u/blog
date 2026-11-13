<script setup lang="ts">
const open = defineModel<boolean>({ default: false })

function onKeydown(event: KeyboardEvent) {
  if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
    event.preventDefault()
    open.value = !open.value
  }
  if (event.key === 'Escape') {
    open.value = false
  }
}

onMounted(() => window.addEventListener('keydown', onKeydown))
onBeforeUnmount(() => window.removeEventListener('keydown', onKeydown))
</script>

<template>
  <Teleport to="body">
    <div
      v-if="open"
      class="mag-scrim site-search-scrim fixed inset-0 z-[100] px-4"
      @click.self="open = false"
    >
      <div
        class="site-search-dialog mx-auto mt-[10vh] w-full max-w-2xl"
        role="dialog"
        aria-modal="true"
        aria-label="搜索"
      >
        <SearchPanel autofocus />
        <button class="site-search-close" type="button" @click="open = false">关闭</button>
      </div>
    </div>
  </Teleport>
</template>
