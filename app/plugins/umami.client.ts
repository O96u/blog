export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig()
  if (!config.public.umamiSrc || !config.public.umamiWebsiteId) {
    return
  }
  useHead({
    script: [
      {
        key: 'umami',
        src: config.public.umamiSrc,
        async: true,
        defer: true,
        'data-website-id': config.public.umamiWebsiteId,
      },
    ],
  })
})
