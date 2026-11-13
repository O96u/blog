<script setup lang="ts">
import { buildFriendSiteProfile, listFriendLinks } from '~~/shared/blog/friend-links'

definePageMeta({ keepalive: true })

const site = useSiteConfig()
const profile = computed(() => buildFriendSiteProfile(String(site.url || '')))
const links = listFriendLinks()

const { stateFor, checkAll } = useFriendLinkProbe()

const onlineCount = computed(() =>
  links.filter((link) => stateFor(link.href).status === 'online').length,
)

onMounted(() => {
  if (!links.length) return
  void checkAll(links.map((link) => ({ href: link.href, avatar: link.avatar })))
})

useSeoMeta({
  title: '友链',
  description: '友情链接、本站资料、入驻说明与留言申请。',
})
</script>

<template>
  <section class="friends-page posts-archive">
    <header class="posts-archive-intro">
      <div class="posts-archive-intro-main">
        <p class="portal-eyebrow">Friends</p>
        <h1 class="posts-archive-title-page">友情链接</h1>
      </div>
      <p v-if="links.length" class="posts-archive-stat friends-page-stat">
        <span class="friends-page-stat-total">
          共 <strong>{{ links.length }}</strong> 个站点
        </span>
        <span class="friends-page-stat-sep" aria-hidden="true">|</span>
        <span class="friends-page-stat-online">
          <UIcon class="friends-page-stat-online-icon" name="i-lucide-radio" aria-hidden="true" />
          <strong>{{ onlineCount }}</strong> 个在线
        </span>
      </p>
      <p v-else class="posts-archive-stat">暂无友链</p>
    </header>

    <div v-if="links.length" class="friends-grid" role="list">
      <FriendsFriendLinkCard
        v-for="link in links"
        :key="link.href"
        role="listitem"
        :link="link"
        :probe="stateFor(link.href)"
      />
    </div>
    <p v-else class="posts-archive-empty text-muted">
      友链列表为空，请在 <code>shared/blog/friend-links.ts</code> 的 <code>friendsConfig</code> 中配置。
    </p>

    <FriendsFriendApplyPanel :profile="profile" />

    <div id="friend-comments" class="friends-comments">
      <CommentThread path="/guestbook/" :enabled="true" />
    </div>
  </section>
</template>
