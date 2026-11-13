export interface SearchDocument {
  id: string
  path: string
  title: string
  description: string
  tags: string
  body: string
}

export interface SearchHit {
  path: string
  title: string
  description: string
  snippet: string
}

const LATIN = /[a-z0-9_#.+-]+/g
const CJK = /[\u4e00-\u9fff]/g

export function tokenizeText(text: string) {
  const source = text.toLowerCase()
  const terms = source.match(LATIN) ?? []
  const characters = source.match(CJK) ?? []
  const bigrams: string[] = []
  for (let index = 0; index < characters.length - 1; index += 1) {
    bigrams.push(`${characters[index]}${characters[index + 1]}`)
  }
  return [...terms, ...characters, ...bigrams]
}

export function searchOptions() {
  return {
    fields: ['title', 'tags', 'description', 'body'],
    storeFields: ['title', 'path', 'description'],
    tokenize: tokenizeText,
    processTerm: (term: string) => term.toLowerCase(),
    searchOptions: {
      boost: { title: 4, tags: 3, description: 2, body: 1 },
      prefix: true,
      combineWith: 'AND' as const,
    },
  }
}

export function makeSnippet(text: string, query: string, radius = 42) {
  const normalized = text.replace(/\s+/g, ' ').trim()
  const terms = [...new Set(tokenizeText(query))].filter(
    (term) => term.length > 1 || /[\u4e00-\u9fff]/.test(term),
  )
  const lower = normalized.toLowerCase()
  let index = -1
  for (const term of terms) {
    index = lower.indexOf(term.toLowerCase())
    if (index >= 0) {
      break
    }
  }
  if (index < 0) {
    return normalized.slice(0, radius * 2)
  }
  const start = Math.max(0, index - radius)
  const end = Math.min(normalized.length, index + radius)
  const prefix = start > 0 ? '…' : ''
  const suffix = end < normalized.length ? '…' : ''
  return `${prefix}${normalized.slice(start, end)}${suffix}`
}
