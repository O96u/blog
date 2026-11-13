<script setup lang="ts">
const error = useError()
const status = computed(() => error.value?.statusCode ?? 500)
</script>

<template>
  <UApp>
    <main class="mx-auto flex min-h-screen max-w-3xl flex-col justify-center px-4">
      <p class="text-sm text-muted">{{ status }}</p>
      <h1 class="mt-2 text-3xl font-semibold">
        {{ status === 404 ? '页面不存在' : '页面暂时无法打开' }}
      </h1>
      <p class="mt-3 text-muted">
        {{ status === 404 ? '这个地址没有对应的文章或页面。' : '请稍后重试。' }}
      </p>
      <NuxtLink class="mt-6 text-primary" to="/"> 返回首页 </NuxtLink>
    </main>
  </UApp>
</template>
