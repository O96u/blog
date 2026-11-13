<script setup lang="ts">
const props = defineProps<{
  path: string
  enabled: boolean
}>()

const config = useRuntimeConfig()
const failed = ref(false)
const loading = ref(false)
const configured = computed(() => Boolean(String(config.public.twikooEnvId || '').trim()))
const elementId = computed(() => `twikoo-${props.path.replace(/[^a-z0-9]+/gi, '-')}`)

async function boot() {
  if (!props.enabled || !configured.value || !import.meta.client) {
    return
  }
  failed.value = false
  loading.value = true
  try {
    await loadScript(String(config.public.twikooSrc))
    const twikoo = (
      window as Window & {
        twikoo?: {
          init: (options: {
            envId: string
            el: string
            path: string
            lang: string
            region?: string
          }) => Promise<void>
        }
      }
    ).twikoo
    if (!twikoo) {
      throw new Error('twikoo unavailable')
    }
    const container = document.getElementById(elementId.value)
    if (container) container.replaceChildren()
    await twikoo.init({
      envId: String(config.public.twikooEnvId),
      el: `#${elementId.value}`,
      path: props.path,
      lang: 'zh-CN',
      ...(config.public.twikooRegion ? { region: String(config.public.twikooRegion) } : {}),
    })
  } catch {
    failed.value = true
  } finally {
    loading.value = false
  }
}

function loadScript(src: string) {
  return new Promise<void>((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(`script[data-twikoo-src="${src}"]`)
    if (existing?.dataset.loaded === 'true') {
      resolve()
      return
    }
    if (existing) {
      existing.addEventListener('load', () => resolve(), { once: true })
      existing.addEventListener('error', () => reject(new Error('twikoo script failed')), {
        once: true,
      })
      return
    }
    const script = document.createElement('script')
    script.src = src
    script.async = true
    script.dataset.twikooSrc = src
    script.onload = () => {
      script.dataset.loaded = 'true'
      resolve()
    }
    script.onerror = () => reject(new Error('twikoo script failed'))
    document.head.appendChild(script)
  })
}

onMounted(boot)
watch(() => props.path, boot)
</script>

<template>
  <section v-if="enabled" class="article-comments" aria-labelledby="article-comments-title">
    <div class="article-comments-head">
      <span class="article-comments-mark" aria-hidden="true"></span>
      <div>
        <h2 id="article-comments-title">评论区</h2>
        <p>分享你的想法，与大家交流讨论</p>
      </div>
    </div>
    <p v-if="!configured" class="article-comments-state">
      评论服务尚未配置，请设置 <code>NUXT_PUBLIC_TWIKOO_ENV_ID</code>。
    </p>
    <p v-else-if="loading" class="article-comments-state">评论加载中…</p>
    <p v-else-if="failed" class="article-comments-state">评论暂时不可用，正文不受影响。</p>
    <div v-show="configured && !failed" :id="elementId" class="article-comments-container" />
  </section>
</template>
