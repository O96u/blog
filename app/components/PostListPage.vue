<script setup lang="ts">
import {
  collectTagNames,
  getPostsByTag,
  paginate,
  postsListRouteLocation,
  postsPagePath,
} from '~~/shared/blog/model'

const props = defineProps<{
  page: number
}>()

const route = useRoute()
const router = useRouter()
const index = await useBlogIndex()

const searchQuery = ref(String(route.query.q ?? ''))
const tagFilter = ref(String(route.query.tag ?? ''))

const tagOptions = computed(() => collectTagNames(index.published))

const filteredPosts = computed(() => {
  let posts = index.published
  if (tagFilter.value) {
    posts = getPostsByTag(posts, tagFilter.value)
  }
  const query = searchQuery.value.trim().toLowerCase()
  if (query) {
    posts = posts.filter(
      (post) =>
        post.title.toLowerCase().includes(query) ||
        post.description.toLowerCase().includes(query) ||
        post.tags.some((tag) => tag.toLowerCase().includes(query)),
    )
  }
  return posts
})

/** 点击先改本地页码，再同步 URL，避免等路由完成才换列表 */
const currentPage = ref(props.page)

watch(
  () => props.page,
  (page) => {
    currentPage.value = page
  },
)

const result = computed(() => paginate(filteredPosts.value, currentPage.value))

const canGoPrev = computed(() => result.value.current > 1)
const canGoNext = computed(() => result.value.current < result.value.totalPages)

function postsListPageTo(pageNumber: number) {
  const query = Object.fromEntries(
    Object.entries(route.query).map(([key, value]) => [
      key,
      Array.isArray(value) ? value[0] : value,
    ]),
  ) as Record<string, string | undefined>
  return postsListRouteLocation(pageNumber, query)
}

function scrollToArchiveGridIfNeeded() {
  if (!import.meta.client) {
    return
  }
  const intro = document.querySelector<HTMLElement>('.posts-archive-intro')
  const grid = document.getElementById('posts-archive-grid')
  if (!intro || !grid) {
    return
  }
  // 已在列表区域附近则不抢滚动，减少「顿一下」
  if (intro.getBoundingClientRect().top > -24 && grid.getBoundingClientRect().top < window.innerHeight) {
    return
  }
  const header = document.querySelector<HTMLElement>('.portal-header')
  const headerHeight = header?.offsetHeight ?? 72
  const top = grid.getBoundingClientRect().top + window.scrollY - headerHeight - 12
  window.scrollTo({ top: Math.max(0, top), behavior: 'auto' })
}

function goToPage(pageNumber: number) {
  if (!import.meta.client) {
    return
  }
  if (pageNumber === currentPage.value) {
    return
  }
  const totalPages = paginate(filteredPosts.value, 1).totalPages
  if (pageNumber < 1 || pageNumber > totalPages) {
    return
  }
  currentPage.value = pageNumber
  void router.replace(postsListPageTo(pageNumber))
  requestAnimationFrame(() => scrollToArchiveGridIfNeeded())
}

function onPageLinkClick(event: MouseEvent, pageNumber: number) {
  if (event.defaultPrevented) {
    return
  }
  if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
    return
  }
  event.preventDefault()
  goToPage(pageNumber)
}

if (props.page < 1 || (props.page > result.value.totalPages && filteredPosts.value.length > 0)) {
  throw createError({ statusCode: 404, statusMessage: 'Page not found', fatal: true })
}

function syncQuery() {
  if (!import.meta.client) {
    return
  }
  const query: Record<string, string> = {}
  if (searchQuery.value.trim()) {
    query.q = searchQuery.value.trim()
  }
  if (tagFilter.value) {
    query.tag = tagFilter.value
  }
  router.replace({ path: postsPagePath(1), query })
}

function selectTag(slug: string) {
  tagFilter.value = tagFilter.value === slug ? '' : slug
  syncQuery()
}

let searchTimer: ReturnType<typeof setTimeout> | undefined
watch(searchQuery, () => {
  clearTimeout(searchTimer)
  searchTimer = setTimeout(syncQuery, 280)
})

watch(
  currentPage,
  (page) => {
    useSeoMeta({
      title: page > 1 ? `文章 第 ${page} 页` : '文章',
      description: '已发布的技术文章',
    })
  },
  { immediate: true },
)
</script>

<template>
  <section class="posts-archive">
    <header class="posts-archive-intro">
      <div class="posts-archive-intro-main">
        <p class="portal-eyebrow">All writing</p>
        <h1 class="posts-archive-title-page">全部文章</h1>
      </div>
      <p class="posts-archive-stat">
        共 {{ filteredPosts.length }} 篇<span v-if="tagFilter || searchQuery">（已筛选）</span
        >，按置顶与发布时间排序
      </p>
    </header>

    <div class="posts-archive-toolbar">
      <label class="posts-archive-search">
        <span class="sr-only">筛选文章</span>
        <UIcon class="posts-archive-search-icon" name="i-lucide-search" aria-hidden="true" />
        <input
          v-model="searchQuery"
          type="search"
          class="posts-archive-search-input"
          placeholder="按标题、摘要或标签搜索"
          autocomplete="off"
        />
      </label>
      <NuxtLink class="posts-archive-tags-link" to="/tags">
        <UIcon name="i-lucide-tags" aria-hidden="true" />
        全部标签
      </NuxtLink>
    </div>

    <div class="posts-archive-filters" role="tablist" aria-label="标签筛选">
      <button
        type="button"
        class="posts-archive-filter"
        :class="{ 'is-active': !tagFilter }"
        :aria-pressed="!tagFilter"
        @click="selectTag('')"
      >
        全部
      </button>
      <button
        v-for="tag in tagOptions.slice(0, 12)"
        :key="tag.slug"
        type="button"
        class="posts-archive-filter"
        :class="{ 'is-active': tagFilter === tag.slug }"
        :aria-pressed="tagFilter === tag.slug"
        @click="selectTag(tag.slug)"
      >
        {{ tag.slug }}
      </button>
    </div>

    <div
      v-if="result.items.length"
      id="posts-archive-grid"
      class="posts-archive-grid"
    >
      <PostsPostArchiveCard v-for="post in result.items" :key="post.path" :post="post" />
    </div>
    <p v-else class="posts-archive-empty text-muted">没有匹配的文章。</p>

    <nav v-if="result.totalPages > 1" class="posts-archive-pagination" aria-label="分页">
      <NuxtLink
        v-if="canGoPrev"
        class="posts-archive-pagination-nav"
        :to="postsListPageTo(result.current - 1)"
        aria-label="上一页"
        @click="onPageLinkClick($event, result.current - 1)"
      >
        <UIcon name="i-lucide-chevron-left" class="size-5" aria-hidden="true" />
      </NuxtLink>
      <span v-else class="posts-archive-pagination-nav is-disabled" aria-disabled="true">
        <UIcon name="i-lucide-chevron-left" class="size-5" aria-hidden="true" />
      </span>

      <span
        v-for="pageNumber in result.totalPages"
        :key="pageNumber"
      >
        <span
          v-if="pageNumber === result.current"
          class="posts-archive-pagination-page is-active"
          aria-current="page"
        >
          {{ pageNumber }}
        </span>
        <NuxtLink
          v-else
          class="posts-archive-pagination-page"
          :to="postsListPageTo(pageNumber)"
          @click="onPageLinkClick($event, pageNumber)"
        >
          {{ pageNumber }}
        </NuxtLink>
      </span>

      <NuxtLink
        v-if="canGoNext"
        class="posts-archive-pagination-nav"
        :to="postsListPageTo(result.current + 1)"
        aria-label="下一页"
        @click="onPageLinkClick($event, result.current + 1)"
      >
        <UIcon name="i-lucide-chevron-right" class="size-5" aria-hidden="true" />
      </NuxtLink>
      <span v-else class="posts-archive-pagination-nav is-disabled" aria-disabled="true">
        <UIcon name="i-lucide-chevron-right" class="size-5" aria-hidden="true" />
      </span>
    </nav>
  </section>
</template>
