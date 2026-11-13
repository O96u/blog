<script setup lang="ts">
import {
  makeSnippet,
  searchOptions,
  type SearchDocument,
  type SearchHit,
} from '~~/shared/blog/search'
import type MiniSearch from 'minisearch'

const props = defineProps<{
  autofocus?: boolean
}>()

const router = useRouter()
const input = ref<HTMLInputElement | null>(null)
const query = ref('')
const loading = ref(false)
const failed = ref(false)
const hits = ref<SearchHit[]>([])
const activeIndex = ref(0)
let engine: MiniSearch<SearchDocument> | null = null
let documents: SearchDocument[] = []
let indexPromise: Promise<void> | null = null

onMounted(async () => {
  void ensureIndex()
  if (props.autofocus) {
    await nextTick()
    input.value?.focus()
  }
})

async function ensureIndex() {
  if (engine) {
    return
  }
  if (indexPromise) return indexPromise

  loading.value = true
  failed.value = false
  indexPromise = (async () => {
    try {
      const [{ default: MiniSearchCtor }, response] = await Promise.all([
        import('minisearch'),
        fetch('/search-index.json'),
      ])
      if (!response.ok) {
        throw new Error('search index missing')
      }
      const payload = (await response.json()) as { documents?: SearchDocument[] }
      if (!Array.isArray(payload.documents)) {
        throw new Error('invalid search index')
      }
      documents = payload.documents
      engine = new MiniSearchCtor<SearchDocument>(searchOptions())
      engine.addAll(documents)
    } catch {
      failed.value = true
    } finally {
      loading.value = false
      indexPromise = null
    }
  })()
  return indexPromise
}

watch(query, async (value) => {
  await ensureIndex()
  if (value !== query.value) return
  const text = value.trim()
  if (!engine || text.length < 1) {
    hits.value = []
    return
  }
  const results = engine.search(text, searchOptions().searchOptions)
  hits.value = results.slice(0, 12).map((result) => {
    const document = documents.find((item) => item.id === result.id)
    return {
      path: String(result.path),
      title: String(result.title),
      description: String(result.description),
      snippet: makeSnippet(document?.body || String(result.description), text),
    }
  })
  activeIndex.value = 0
})

function submit() {
  const text = query.value.trim()
  if (text) {
    track('search', { query: text })
  }
  const hit = hits.value[activeIndex.value] ?? hits.value[0]
  if (hit) void router.push(hit.path)
}

function onInputKeydown(event: KeyboardEvent) {
  if (!hits.value.length) return
  if (event.key === 'ArrowDown') {
    event.preventDefault()
    activeIndex.value = (activeIndex.value + 1) % hits.value.length
  } else if (event.key === 'ArrowUp') {
    event.preventDefault()
    activeIndex.value = (activeIndex.value - 1 + hits.value.length) % hits.value.length
  }
}
</script>

<template>
  <form class="site-search-panel" role="search" @submit.prevent="submit">
    <label class="site-search-label" for="site-search">搜索文章</label>
    <div class="site-search-input-wrap">
      <UIcon name="i-lucide-search" aria-hidden="true" />
      <input
        id="site-search"
        ref="input"
        v-model="query"
        type="search"
        name="q"
        placeholder="输入标题、标签或正文关键词"
        autocomplete="off"
        :autofocus="props.autofocus"
        @keydown="onInputKeydown"
      />
    </div>
    <p v-if="loading" class="site-search-state">正在加载搜索索引…</p>
    <p v-else-if="failed" class="site-search-state site-search-state--error">
      搜索索引暂时不可用，文章仍可从列表打开。
    </p>
    <p v-else-if="query.trim() && !hits.length" class="site-search-state">
      没有找到“{{ query.trim() }}”，可以换一个关键词试试。
    </p>
    <ol v-else-if="hits.length" class="site-search-results" aria-label="搜索结果">
      <li v-for="(hit, index) in hits" :key="hit.path">
        <NuxtLink
          :to="hit.path"
          class="site-search-result"
          :class="{ 'is-active': index === activeIndex }"
          @mouseenter="activeIndex = index"
        >
          <strong>{{ hit.title }}</strong>
          <span>{{ hit.snippet }}</span>
          <small>打开文章 <span aria-hidden="true">↗</span></small>
        </NuxtLink>
      </li>
    </ol>
    <p v-if="hits.length" class="site-search-hint">↑↓ 选择 · Enter 打开 · Esc 关闭</p>
  </form>
</template>
