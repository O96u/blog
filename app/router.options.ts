import type { RouterConfig } from '@nuxt/schema'

export default {
  scrollBehavior(to, _from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    }
    if (to.hash) {
      return { el: to.hash, behavior: 'auto', top: 80 }
    }
    return { top: 0, left: 0 }
  },
} satisfies RouterConfig
