<script setup lang="ts">
import type { FriendLink } from '~~/shared/blog/friend-links'
import type { FriendProbeState } from '~~/shared/blog/friend-probe'
import { friendProbeStatusLabel } from '~~/shared/blog/friend-probe'

const props = defineProps<{
  link: FriendLink
  probe: FriendProbeState
}>()

const statusLabel = computed(() => friendProbeStatusLabel(props.probe))

const host = computed(() => {
  try {
    return new URL(props.link.href).hostname.replace(/^www\./, '')
  } catch {
    return props.link.href.replace(/^https?:\/\//, '').split('/')[0]
  }
})
</script>

<template>
  <a
    class="friends-card"
    :class="{
      'friends-card--online': probe.status === 'online',
      'friends-card--offline': probe.status === 'offline',
    }"
    :href="link.href"
    target="_blank"
    rel="noopener noreferrer"
  >
    <div class="friends-card-meta">
      <span
        class="friends-card-status"
        :class="`friends-card-status--${probe.status}`"
        :aria-live="probe.status === 'checking' ? 'polite' : undefined"
      >
        <span class="friends-card-status-dot" aria-hidden="true" />
        {{ statusLabel }}
      </span>
      <span
        v-if="probe.status === 'online' && probe.latencyMs !== null"
        class="friends-card-latency"
      >
        <UIcon name="i-lucide-gauge" class="size-3.5" aria-hidden="true" />
        {{ probe.latencyMs }}ms
      </span>
    </div>

    <img
      v-if="link.avatar"
      class="friends-card-avatar"
      :src="link.avatar"
      width="52"
      height="52"
      alt=""
      loading="lazy"
      decoding="async"
    />
    <span v-else class="friends-card-avatar friends-card-avatar--fallback" aria-hidden="true">
      {{ link.name.slice(0, 1) }}
    </span>

    <span class="friends-card-body">
      <span class="friends-card-name">{{ link.name }}</span>
      <span class="friends-card-host">
        <UIcon name="i-lucide-link" class="size-3.5" aria-hidden="true" />
        {{ host }}
      </span>
      <span class="friends-card-desc">{{ link.description }}</span>
    </span>
  </a>
</template>
