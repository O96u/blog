const GITHUB_MDC = /::github\{repo=["']([^"']+)["']\}/g

const FENCE_LANG_ALIASES: Record<string, string> = {
  js: 'js',
  javascript: 'js',
  ts: 'ts',
  typescript: 'ts',
  py: 'python',
  python: 'python',
  sh: 'bash',
  shell: 'bash',
  yml: 'yaml',
  txt: 'text',
  text: 'text',
  powershell: 'powershell',
  java: 'java',
  php: 'php',
  xml: 'xml',
  nginx: 'nginx',
  ini: 'ini',
  sql: 'sql',
  json: 'json',
  yaml: 'yaml',
  bash: 'bash',
  html: 'html',
  css: 'css',
  md: 'md',
  mermaid: 'mermaid',
  diff: 'diff',
  toml: 'toml',
}

const GFM_ALERT = /^> \[!(TIP|WARNING|NOTE|CAUTION|IMPORTANT)\]\s*$/i

function mapAlertType(kind: string) {
  const upper = kind.toUpperCase()
  if (upper === 'TIP') return 'tip'
  if (upper === 'WARNING') return 'warning'
  if (upper === 'CAUTION' || upper === 'IMPORTANT') return 'danger'
  return 'info'
}

function inferFenceLanguage(code: string) {
  const sample = code.trim().slice(0, 1200)
  const first = sample.split('\n').find((line) => line.trim())?.trim() ?? ''
  if (/^<\?php/i.test(first) || /<\?php/i.test(sample)) return 'php'
  if (/^\s*(public|private|protected)\s+(class|interface|enum)\s+/m.test(sample)) return 'java'
  if (/^\s*import\s+\w+/m.test(sample) || /^\s*def\s+\w+/m.test(sample)) return 'python'
  if (/^\s*\{[\s\S]*"[\w-]+"\s*:/m.test(sample) && first.startsWith('{')) return 'json'
  if (/^\s*---\s*$/m.test(sample) || /:\s+[^\s]/.test(first) && !first.includes('=')) return 'yaml'
  if (/^\s*server\s*\{|^\s*location\s|listen\s+\d+/m.test(sample)) return 'nginx'
  if (/^\s*\[/.test(first) && /=/.test(sample)) return 'ini'
  if (
    /^(sudo\s+)?(apt|yum|dnf|pacman|curl|wget|cd\s|chmod|chown|docker|systemctl|npm|pnpm|pip)\b/m.test(
      sample,
    )
  ) {
    return 'bash'
  }
  if (/^#+/.test(first) || /^[\w.-]+\s*$/.test(first)) return 'text'
  return 'bash'
}

function resolveFenceLanguage(info: string, code: string) {
  const token = info.trim().split(/\s+/)[0] ?? ''
  let lang = token
    ? (FENCE_LANG_ALIASES[token.toLowerCase()] ?? token.toLowerCase())
    : inferFenceLanguage(code)
  if ((lang === 'js' || lang === 'javascript') && /<\?php|static function|switch\s*\(/.test(code)) {
    lang = 'php'
  }
  if ((lang === 'js' || lang === 'javascript') && /\.ai-summary|display:\s*none|^\./m.test(code)) {
    lang = 'css'
  }
  if (lang === 'txt') {
    lang = 'text'
  }
  return lang
}

const FENCE_RE = new RegExp('```([^\\n`]*)\\n([\\s\\S]*?)```', 'g')

/**
 * 旧迁移脚本会把结束围栏也写成 ```bash / ```text。
 * 按 Markdown 围栏的开、关顺序统一把结束行还原成纯 ```。
 */
export function normalizeFenceClosers(body: string) {
  let insideFence = false
  return body
    .split('\n')
    .map((line) => {
      if (!/^\s*`{3,}[^`]*$/.test(line)) return line
      if (!insideFence) {
        insideFence = true
        return line
      }
      insideFence = false
      const indent = line.match(/^\s*/)?.[0] ?? ''
      const ticks = line.match(/`{3,}/)?.[0] ?? '```'
      return `${indent}${ticks}`
    })
    .join('\n')
}

export function formatImportedPostBody(body: string) {
  let text = normalizeFenceClosers(body.replace(/\r\n/g, '\n'))

  text = text.replace(GITHUB_MDC, (_full, repo: string) => {
    const path = String(repo).trim()
    return `\n\n[GitHub：${path}](https://github.com/${path})\n\n`
  })

  text = text.replace(/^\[grid]\s*$/gim, '').replace(/^\[\/grid]\s*$/gim, '')

  const gfmLines: string[] = []
  const lines = text.split('\n')
  let index = 0
  while (index < lines.length) {
    const line = lines[index] ?? ''
    const alert = line.match(GFM_ALERT)
    if (alert) {
      const kind = mapAlertType(alert[1] ?? 'NOTE')
      index += 1
      const block: string[] = []
      while (index < lines.length) {
        const quoted = lines[index] ?? ''
        if (!quoted.startsWith('>')) {
          break
        }
        block.push(quoted.replace(/^>\s?/, ''))
        index += 1
      }
      gfmLines.push(`::callout{type="${kind}"}`)
      gfmLines.push(...block)
      gfmLines.push('::')
      continue
    }
    gfmLines.push(line)
    index += 1
  }
  text = gfmLines.join('\n')

  text = text.replace(FENCE_RE, (_match, info: string, code: string) => {
    const lang = resolveFenceLanguage(info, code)
    return '```' + lang + '\n' + code + '```'
  })

  return text.replace(/\n{4,}/g, '\n\n\n').trimEnd() + '\n'
}
