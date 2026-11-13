<script setup lang="ts">
import {
  buildFriendApplyText,
  type FriendSiteProfile,
  FRIEND_APPLY_STEPS,
  FRIEND_GUIDELINES,
} from '~~/shared/blog/friend-links'

const props = defineProps<{
  profile: FriendSiteProfile
}>()

const copiedKey = ref<string | null>(null)

const profileFields = computed(() => [
  { key: 'name', label: '本站名称', value: props.profile.name },
  { key: 'description', label: '本站介绍', value: props.profile.description },
  { key: 'url', label: '本站地址', value: props.profile.url },
  { key: 'logo', label: '本站 Logo', value: props.profile.logo },
])

const applyTemplate = computed(() => buildFriendApplyText(props.profile))

async function copyValue(key: string, text: string) {
  try {
    await navigator.clipboard.writeText(text)
    copiedKey.value = key
    window.setTimeout(() => {
      if (copiedKey.value === key) {
        copiedKey.value = null
      }
    }, 1600)
  } catch {
    copiedKey.value = null
  }
}
</script>

<template>
  <div id="friend-link-apply" class="friends-apply-board">
    <div class="friends-apply-grid">
      <aside class="friends-site-info" aria-labelledby="friends-site-info-title">
        <h2 id="friends-site-info-title" class="friends-panel-title">本站信息</h2>
        <img
          class="friends-site-info-logo"
          :src="profile.logo"
          width="72"
          height="72"
          alt=""
          decoding="async"
        />
        <dl class="friends-site-info-fields">
          <div v-for="field in profileFields" :key="field.key" class="friends-site-info-row">
            <dt>{{ field.label }}</dt>
            <dd>
              <span class="friends-site-info-value">{{ field.value }}</span>
              <button
                class="friends-copy-icon"
                type="button"
                :aria-label="`复制${field.label}`"
                @click="copyValue(field.key, field.value)"
              >
                <UIcon
                  :name="copiedKey === field.key ? 'i-lucide-check' : 'i-lucide-copy'"
                  class="size-4"
                  aria-hidden="true"
                />
              </button>
            </dd>
          </div>
        </dl>
      </aside>

      <div class="friends-apply-flow" aria-labelledby="friends-apply-flow-title">
        <h2 id="friends-apply-flow-title" class="friends-panel-title">申请友链</h2>
        <ol class="friends-steps">
          <li v-for="(step, index) in FRIEND_APPLY_STEPS" :key="step.title">
            <span class="friends-step-index">{{ index + 1 }}</span>
            <div>
              <h3 class="friends-step-title">{{ step.title }}</h3>
              <p class="friends-step-body">{{ step.body }}</p>
              <pre
                v-if="index === 1"
                class="friends-apply-template"
                aria-label="留言申请模板"
              >{{ applyTemplate }}</pre>
            </div>
          </li>
        </ol>
      </div>
    </div>

    <section class="friends-guidelines" aria-labelledby="friends-guidelines-title">
      <h2 id="friends-guidelines-title" class="friends-guidelines-title">
        <UIcon name="i-lucide-info" class="friends-guidelines-icon size-5" aria-hidden="true" />
        入驻说明
      </h2>
      <ul class="friends-guidelines-list">
        <li v-for="(item, index) in FRIEND_GUIDELINES" :key="index">{{ item }}</li>
      </ul>
    </section>
  </div>
</template>
