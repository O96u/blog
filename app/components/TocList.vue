<script setup lang="ts">
const props = defineProps<{
  links: Array<{ id: string; text: string; children?: Array<{ id: string; text: string }> }>
}>()

const activeId = ref('')
let frame = 0

const headingIds = computed(() =>
  props.links.flatMap((link) => [link.id, ...(link.children?.map((child) => child.id) ?? [])]),
)

function updateActiveHeading() {
  cancelAnimationFrame(frame)
  frame = requestAnimationFrame(() => {
    const offset = 112
    let current = headingIds.value[0] ?? ''
    for (const id of headingIds.value) {
      const heading = document.getElementById(id)
      if (!heading) continue
      if (heading.getBoundingClientRect().top <= offset) current = id
      else break
    }
    activeId.value = current
  })
}

onMounted(() => {
  updateActiveHeading()
  window.addEventListener('scroll', updateActiveHeading, { passive: true })
  window.addEventListener('resize', updateActiveHeading, { passive: true })
})

onBeforeUnmount(() => {
  cancelAnimationFrame(frame)
  window.removeEventListener('scroll', updateActiveHeading)
  window.removeEventListener('resize', updateActiveHeading)
})
</script>

<template>
  <ol class="article-toc-list">
    <li v-for="link in links" :key="link.id">
      <a
        :href="`#${link.id}`"
        :class="{ 'is-active': activeId === link.id }"
        :aria-current="activeId === link.id ? 'location' : undefined"
        @click="activeId = link.id"
      >{{ link.text }}</a>
      <ol v-if="link.children?.length" class="article-toc-children">
        <li v-for="child in link.children" :key="child.id">
          <a
            :href="`#${child.id}`"
            :class="{ 'is-active': activeId === child.id }"
            :aria-current="activeId === child.id ? 'location' : undefined"
            @click="activeId = child.id"
          >{{ child.text }}</a>
        </li>
      </ol>
    </li>
  </ol>
</template>
