<script setup lang="ts">
const visible = ref(false)
const progress = ref(0)

function updateScrollState() {
  const root = document.documentElement
  const scrollable = Math.max(root.scrollHeight - window.innerHeight, 1)
  progress.value = Math.min(100, Math.max(0, (window.scrollY / scrollable) * 100))
  visible.value = window.scrollY > 560
}

function backToTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

onMounted(() => {
  updateScrollState()
  window.addEventListener('scroll', updateScrollState, { passive: true })
  window.addEventListener('resize', updateScrollState, { passive: true })
})

onBeforeUnmount(() => {
  window.removeEventListener('scroll', updateScrollState)
  window.removeEventListener('resize', updateScrollState)
})
</script>

<template>
  <div class="article-reading-progress" aria-hidden="true">
    <span :style="{ width: `${progress}%` }"></span>
  </div>
  <Transition name="article-back-top">
    <button
      v-if="visible"
      type="button"
      class="article-back-top"
      aria-label="回到文章顶部"
      title="回到顶部"
      @click="backToTop"
    >
      <span aria-hidden="true">↑</span>
    </button>
  </Transition>
</template>
