import type { FriendProbeState } from '~~/shared/blog/friend-probe'

const PROBE_TIMEOUT_MS = 12_000

function probeImage(url: string): Promise<boolean> {
  return new Promise((resolve) => {
    const img = new Image()
    let settled = false
    const done = (ok: boolean) => {
      if (settled) return
      settled = true
      window.clearTimeout(timer)
      resolve(ok)
    }
    const timer = window.setTimeout(() => done(false), PROBE_TIMEOUT_MS)
    img.onload = () => done(true)
    img.onerror = () => done(false)
    const join = url.includes('?') ? '&' : '?'
    img.src = `${url}${join}_probe=${Date.now()}`
  })
}

export function useFriendLinkProbe() {
  const states = ref<Record<string, FriendProbeState>>({})

  function stateFor(href: string): FriendProbeState {
    return states.value[href] ?? { status: 'idle', latencyMs: null }
  }

  async function checkLink(href: string, avatar?: string) {
    if (!import.meta.client) return
    states.value = { ...states.value, [href]: { status: 'checking', latencyMs: null } }
    const started = performance.now()

    try {
      const controller = new AbortController()
      const timer = window.setTimeout(() => controller.abort(), PROBE_TIMEOUT_MS)
      await fetch(href, { mode: 'no-cors', signal: controller.signal, cache: 'no-store' })
      window.clearTimeout(timer)
      states.value = {
        ...states.value,
        [href]: { status: 'online', latencyMs: Math.round(performance.now() - started) },
      }
      return
    } catch {
      // continue
    }

    const candidates: string[] = []
    if (avatar?.trim()) candidates.push(avatar.trim())
    try {
      candidates.push(new URL('/favicon.ico', href).href)
    } catch {
      // ignore
    }

    for (const target of candidates) {
      const imageStarted = performance.now()
      const ok = await probeImage(target)
      if (ok) {
        states.value = {
          ...states.value,
          [href]: { status: 'online', latencyMs: Math.round(performance.now() - imageStarted) },
        }
        return
      }
    }

    states.value = { ...states.value, [href]: { status: 'offline', latencyMs: null } }
  }

  async function checkAll(links: Array<{ href: string; avatar?: string }>) {
    await Promise.all(links.map((link) => checkLink(link.href, link.avatar)))
  }

  return { stateFor, checkAll }
}
