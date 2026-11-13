import { DEFAULT_SITE_URL, SITE_NAME } from './site-meta.ts'

/** Firefly / muxui 友链配置（`friendsConfig`） */

export type FriendLinkConfig = {
  title: string
  imgurl: string
  desc: string
  siteurl: string
  weight: number
  enabled: boolean
}

export const friendsConfig: FriendLinkConfig[] = [
  {
    title: '开发工具箱',
    imgurl: 'https://muxui.com/favicon.ico',
    desc: '专属于程序员的工具箱',
    siteurl: 'https://muxui.com/tools/',
    weight: 10,
    enabled: true,
  },
  {
    title: '朱某的生活印记',
    imgurl: 'https://img1.zhuxu.asia/img/logo500.png',
    desc: '没有销声匿迹，我在热爱生活',
    siteurl: 'https://zhuxu.asia/',
    weight: 10,
    enabled: true,
  },
  {
    title: '小栋博客',
    imgurl:
      'https://blog.biekanle.com/wp-content/uploads/thumb/2024/05/fill_w192_h192_g0_mark_62481ff7d04bee376f97a9beb597e5ce.webp',
    desc: '小栋博客',
    siteurl: 'https://blog.biekanle.com/',
    weight: 9,
    enabled: true,
  },
]

/** 页面展示用，已按 weight 排序并过滤 disabled */
export type FriendLink = {
  name: string
  href: string
  description: string
  avatar: string
  weight: number
}

export function listFriendLinks(): FriendLink[] {
  return friendsConfig
    .filter((item) => item.enabled && item.title.trim() && item.siteurl.trim())
    .sort((a, b) => b.weight - a.weight)
    .map((item) => ({
      name: item.title,
      href: item.siteurl.trim(),
      description: item.desc,
      avatar: item.imgurl.trim(),
      weight: item.weight,
    }))
}

export const FRIEND_LINKS = listFriendLinks()

export type FriendSiteProfile = {
  name: string
  url: string
  description: string
  logo: string
}

export function buildFriendSiteProfile(siteUrl = DEFAULT_SITE_URL): FriendSiteProfile {
  const origin = siteUrl.replace(/\/$/, '')
  return {
    name: SITE_NAME,
    url: origin,
    description: '个人技术博客，记录开发实践、软件整理与自建折腾。',
    logo: `${origin}/favicon.ico`,
  }
}

export function buildFriendApplyText(profile: FriendSiteProfile) {
  return [
    `网站名称：${profile.name}`,
    `网站介绍：${profile.description}`,
    `网站地址：${profile.url}`,
    `网站 Logo：${profile.logo}`,
  ].join('\n')
}

export const FRIEND_APPLY_STEPS = [
  {
    title: '添加本站友链',
    body: '请在你的网站友链页面，先添加本站链接信息。',
  },
  {
    title: '留言申请',
    body: '在本页底部评论区提交你的站点信息，按下文模板填写。',
  },
  {
    title: '等待审核',
    body: '请不要在本站提交完链接就直接走人，我会留言回复；未通过也会说明原因。',
  },
] as const

export const FRIEND_GUIDELINES: string[] = [
  '备案要求：您的网站必须已完成国内 ICP 备案！',
  '互换范围：欢迎同类站点交换友情链接，例如个人博客、WordPress 类站点。',
  '首页链接：首页链接有一定的限制，如果要求首页链接，必须双方同等待遇。',
  '申请流程：请勿在本站提交完链接就直接走人，请联系博主通过申请；如果没有通过，将在留言区做出回应。',
  '内容合规：提交链接前请确认您的网站没有违反中华人民共和国各项法律、法规的内容，没有违背社会道德之内容！',
  '链接维护：博主会定期检查死链等无效链接，如果发现贵站取消链接，我们也将删除，不另行通知站长。',
  '提交说明：请先在贵站上做好本站链接，再仿照本站的链接信息申请入驻即可。',
]
