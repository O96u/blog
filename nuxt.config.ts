import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import {
  getPublishedPosts,
  isIndexable,
  PAGE_SIZE,
  postsPagePath,
  tagPath,
} from './shared/blog/model.ts'
import { readAllPosts } from './shared/blog/source.ts'
import { redirectListSchema } from './shared/blog/schema.ts'
import { SITE_DESCRIPTION, SITE_NAME } from './shared/blog/feeds.ts'

const rootDir = process.cwd()
const posts = readAllPosts(rootDir)
const published = getPublishedPosts(posts)
const tags = [...new Set(published.flatMap((post) => post.tags))]
const pages = Math.max(1, Math.ceil(published.length / PAGE_SIZE))
const redirects = redirectListSchema.parse(
  JSON.parse(readFileSync(join(rootDir, 'data', 'redirects.json'), 'utf8')),
)

const prerenderRoutes = [
  '/',
  '/posts',
  '/archives',
  '/tags',
  '/search',
  '/about',
  '/friends',
  '/rss.xml',
  '/sitemap.xml',
  ...published.map((post) => post.path),
  ...tags.map((tag) => tagPath(tag)),
  ...Array.from({ length: pages }, (_, index) => postsPagePath(index + 1)),
]

const routeRules: Record<string, object> = {
  '/search': { robots: false },
  '/__nuxt_content/**': { robots: false },
}

for (const post of posts) {
  if (!isIndexable(post)) {
    routeRules[post.path] = { robots: false }
  }
}

for (const redirect of redirects) {
  routeRules[redirect.from] = {
    redirect: { to: redirect.to, statusCode: redirect.status },
  }
}

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  modules: ['./modules/blog', '@nuxt/ui', '@nuxt/content', '@nuxtjs/seo', '@nuxt/eslint'],
  css: ['katex/dist/katex.min.css', '~/assets/css/main.css'],
  app: {
    pageTransition: false,
    layoutTransition: false,
    head: {
      htmlAttrs: { lang: 'zh-CN' },
      link: [{ rel: 'alternate', type: 'application/rss+xml', href: '/rss.xml', title: SITE_NAME }],
    },
  },
  site: {
    url: process.env.NUXT_SITE_URL || 'https://blog.example.com',
    name: SITE_NAME,
    description: SITE_DESCRIPTION,
    defaultLocale: 'zh-CN',
  },
  ui: {
    fonts: false,
  },
  colorMode: {
    classSuffix: '',
    preference: 'system',
    fallback: 'light',
  },
  runtimeConfig: {
    public: {
      // 图片解析模式：local 读取 public/media/posts，remote 读取 manifest 中的远程地址。
      imageMode: process.env.NUXT_PUBLIC_IMAGE_MODE || 'local',
      // Twikoo 评论配置：后端地址/CloudBase 环境 ID、地域以及固定版本的前端脚本。
      twikooEnvId: process.env.NUXT_PUBLIC_TWIKOO_ENV_ID || 'https://s.muxui.com:8013',
      twikooRegion: process.env.NUXT_PUBLIC_TWIKOO_REGION || '',
      twikooSrc:
        process.env.NUXT_PUBLIC_TWIKOO_SRC ||
        'https://cdn.jsdelivr.net/npm/twikoo@2.0.17/dist/twikoo.min.js',
      // Umami 统计配置：脚本地址与 Website ID 必须同时设置才会加载。
      umamiSrc: process.env.NUXT_PUBLIC_UMAMI_SRC || '',
      umamiWebsiteId: process.env.NUXT_PUBLIC_UMAMI_WEBSITE_ID || '',
      // 页脚和站点资料配置；公开变量中不得存放访问令牌或其他密钥。
      githubUrl: process.env.NUXT_PUBLIC_GITHUB_URL || '',
      siteLegalName: process.env.NUXT_PUBLIC_SITE_LEGAL_NAME || '',
      siteIcp: process.env.NUXT_PUBLIC_SITE_ICP || '',
      siteGongan: process.env.NUXT_PUBLIC_SITE_GONGAN || '',
    },
  },
  content: {
    experimental: {
      sqliteConnector: 'native',
    },
    build: {
      markdown: {
        toc: {
          depth: 3,
          searchDepth: 3,
        },
        remarkPlugins: {
          'remark-math': {},
        },
        rehypePlugins: {
          'rehype-katex': {
            options: {
              output: 'htmlAndMathml',
              throwOnError: true,
            },
          },
        },
        highlight: {
          theme: {
            default: 'github-light',
            dark: 'github-dark',
          },
          langs: [
            'json',
            'js',
            'ts',
            'tsx',
            'html',
            'css',
            'vue',
            'shell',
            'bash',
            'mdc',
            'md',
            'yaml',
            'python',
            'diff',
          ],
        },
      },
    },
  },
  mdc: {
    highlight: {
      theme: {
        default: 'github-light',
        dark: 'github-dark',
      },
    },
    components: {
      map: {
        callout: 'BlogCallout',
      },
    },
  },
  sitemap: {
    exclude: [
      '/search',
      '/search/**',
      '/__nuxt_content/**',
      ...posts.filter((post) => !isIndexable(post)).map((post) => post.path),
    ],
  },
  robots: {
    disallow: [],
  },
  ogImage: false,
  typescript: {
    nodeTsConfig: {
      compilerOptions: {
        types: ['node'],
      },
    },
    sharedTsConfig: {
      compilerOptions: {
        types: ['node'],
      },
    },
  },
  routeRules,
  nitro: {
    prerender: {
      crawlLinks: true,
      routes: prerenderRoutes,
    },
  },
})
