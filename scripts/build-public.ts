import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import sharp from 'sharp'
import { readAllPosts } from '../shared/blog/source.ts'
import { renderRss, renderSearchIndex } from '../shared/blog/feeds.ts'
import { redirectListSchema } from '../shared/blog/schema.ts'

const rootDir = process.cwd()

function write(file: string, contents: string) {
  mkdirSync(dirname(file), { recursive: true })
  writeFileSync(file, contents)
}

const posts = readAllPosts(rootDir)
write(join(rootDir, 'public', 'search-index.json'), renderSearchIndex(posts))
write(join(rootDir, 'public', 'rss.xml'), renderRss(posts))

const ogFile = join(rootDir, 'public', 'og', 'default.png')
mkdirSync(dirname(ogFile), { recursive: true })
await sharp({
  create: {
    width: 1200,
    height: 630,
    channels: 3,
    background: '#0f766e',
  },
})
  .png()
  .toFile(ogFile)

const redirects = redirectListSchema.parse(
  JSON.parse(readFileSync(join(rootDir, 'data', 'redirects.json'), 'utf8')),
)
const nginx = redirects
  .map((rule) => `location = ${rule.from} { return 301 ${rule.to}; }`)
  .join('\n')
write(join(rootDir, 'deploy', 'redirects.conf'), `${nginx}\n`)

console.log(`public assets ready: ${posts.length} posts, ${redirects.length} redirects`)
