<script setup lang="ts">
const route = useRoute()
const colorMode = useColorMode()
const searchOpen = ref(false)

const links = [
  { to: '/', label: '首页' },
  { to: '/posts', label: '文章' },
  { to: '/archives', label: '归档' },
  { to: '/tags', label: '标签' },
  { to: '/friends', label: '友链' },
  { to: '/about', label: '关于' },
]

function toggleTheme() {
  const next = colorMode.value === 'dark' ? 'light' : 'dark'
  colorMode.preference = next
  track('theme', { mode: next })
}

function openSearch() {
  searchOpen.value = true
}

watch(
  () => route.path,
  () => {
    searchOpen.value = false
  },
)
</script>

<template>
  <header
    class="portal-header sticky top-0 z-40 border-b border-default bg-elevated/95 backdrop-blur-sm"
  >
    <div class="mag-container portal-header-inner">
      <NuxtLink class="portal-brand" to="/">Muxui</NuxtLink>

      <nav class="portal-header-nav flex" aria-label="主导航">
        <NuxtLink
          v-for="link in links"
          :key="link.to"
          class="portal-nav-link"
          :to="link.to"
          prefetch
          prefetch-on="visibility"
        >
          {{ link.label }}
        </NuxtLink>
      </nav>

      <div class="portal-header-actions">
        <button
          class="portal-search-field flex"
          type="button"
          aria-label="打开搜索"
          @click="openSearch"
        >
          <UIcon class="portal-search-icon" name="i-lucide-search" aria-hidden="true" />
          <span class="portal-search-placeholder">搜索文章…</span>
          <kbd class="portal-kbd" aria-hidden="true">Ctrl K</kbd>
        </button>
        <button
          class="portal-icon-btn"
          type="button"
          :aria-label="colorMode.value === 'dark' ? '浅色' : '深色'"
          @click="toggleTheme"
        >
          <UIcon
            class="size-5"
            :name="colorMode.value === 'dark' ? 'i-lucide-sun' : 'i-lucide-moon'"
            aria-hidden="true"
          />
        </button>
      </div>
    </div>
    <SearchDialog v-model="searchOpen" />
  </header>
</template>
