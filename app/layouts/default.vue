<template>
  <div class="flex min-h-screen flex-col">
    <a class="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:m-3" href="#content"
      >跳到正文</a
    >
    <SiteHeader />
    <main id="content" class="mag-container w-full max-w-[80rem] flex-1 py-8 md:py-12">
      <slot />
    </main>
    <SiteFooter />
  </div>
</template>
