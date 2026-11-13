import { mkdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { postsDirectory } from '../shared/blog/source.ts'

const slug = argument('slug')
const title = argument('title')
if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
  throw new Error('--slug 只能使用小写英文、数字和连字符')
}
const file = join(postsDirectory(process.cwd()), `${slug}.md`)
const today = new Date().toISOString().slice(0, 10)
mkdirSync(postsDirectory(process.cwd()), { recursive: true })
writeFileSync(
  file,
  `---
slug: ${slug}
title: ${yamlString(title)}
description: 待补充摘要
date: ${today}
draft: true
tags: []
toc: true
comments: true
searchable: true
---

在这里写正文。新文章默认是草稿，校验通过并人工审核后再把 \`draft\` 改为 \`false\`。
`,
)
console.log(file)

function argument(name: string) {
  const index = process.argv.indexOf(`--${name}`)
  const value = index >= 0 ? process.argv[index + 1] : ''
  if (!value) {
    throw new Error(`缺少 --${name}`)
  }
  return value
}

function yamlString(value: string) {
  return JSON.stringify(value)
}
