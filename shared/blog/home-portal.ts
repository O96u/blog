import type { BlogPost } from './model'
import { sortChronological, tagSlug } from './model'

export interface HomeTopic {
  id: string
  title: string
  description: string
  tagSlugs: string[]
}

export const HOME_TOPICS: HomeTopic[] = [
  {
    id: 'frontend',
    title: '前端工程',
    description: 'Vue、Nuxt 与界面实现',
    tagSlugs: ['nuxt', 'vue', 'css', 'typescript'],
  },
  {
    id: 'devops',
    title: 'DevOps',
    description: '构建、发布与运行环境',
    tagSlugs: ['node'],
  },
  {
    id: 'ai',
    title: 'AI 工具',
    description: '提效工具与工作流',
    tagSlugs: [],
  },
  {
    id: 'system',
    title: '系统设计',
    description: 'SEO、索引与站点治理',
    tagSlugs: ['seo'],
  },
]

export function postsMatchingTopicTags<T extends Pick<BlogPost, 'tags' | 'path' | 'date'>>(
  posts: T[],
  tagSlugs: string[],
  limit = 4,
) {
  if (tagSlugs.length === 0) {
    return []
  }
  const wanted = new Set(tagSlugs.map(tagSlug))
  return sortChronological(
    posts.filter((post) => post.tags.some((tag) => wanted.has(tagSlug(tag)))),
  ).slice(0, limit)
}

export function homeTopicsWithPosts<T extends BlogPost>(posts: T[], limit = 4) {
  return HOME_TOPICS.map((topic) => ({
    topic,
    posts: postsMatchingTopicTags(posts, topic.tagSlugs, limit),
  })).filter((item) => item.posts.length > 0)
}

export const HOME_FEED_PAGE_SIZE = 5
