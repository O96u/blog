<script setup lang="ts">
const props = withDefaults(defineProps<{
  src?: string
  alt?: string
  width?: string | number
  height?: string | number
}>(), {
  src: '',
  alt: '',
  width: undefined,
  height: undefined,
})

const { url } = useImageUrl()
const dialog = ref<HTMLDialogElement | null>(null)
const resolved = computed(() => url(props.src))

function open() {
  dialog.value?.showModal()
}
</script>

<template>
  <span class="my-4 block">
    <button type="button" class="block max-w-full" @click="open">
      <img
        :src="resolved"
        :alt="alt"
        :width="width"
        :height="height"
        class="h-auto max-w-full rounded-lg"
        loading="lazy"
      >
    </button>
    <dialog ref="dialog" class="max-w-[min(96vw,72rem)] rounded-lg bg-default p-3">
      <img :src="resolved" :alt="alt" class="h-auto max-h-[80vh] max-w-full">
      <form method="dialog" class="mt-3 text-right">
        <button type="submit">关闭</button>
      </form>
    </dialog>
  </span>
</template>
