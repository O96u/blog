import { createReadStream, existsSync, statSync } from 'node:fs'
import { createServer } from 'node:http'
import { extname, join, normalize, resolve } from 'node:path'

const root = resolve('.output/public')
const port = Number(process.env.PORT || 4173)

const types = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.ico': 'image/x-icon',
  '.js': 'text/javascript; charset=utf-8',
  '.avif': 'image/avif',
  '.gif': 'image/gif',
  '.jpeg': 'image/jpeg',
  '.jpg': 'image/jpeg',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.mjs': 'text/javascript; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.ttf': 'font/ttf',
  '.txt': 'text/plain; charset=utf-8',
  '.wasm': 'application/wasm',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.xml': 'application/xml; charset=utf-8',
  '.xsl': 'application/xml; charset=utf-8',
}

if (!existsSync(root)) {
  console.error('Missing .output/public. Run pnpm generate first.')
  process.exit(1)
}

function resolveFile(urlPath) {
  const pathname = decodeURIComponent((urlPath || '/').split('?')[0] || '/')
  const relative = normalize(pathname).replace(/^([/\\]|\.\.[/\\])+/, '')
  const absolute = resolve(root, relative)

  if (absolute !== root && !absolute.startsWith(`${root}\\`) && !absolute.startsWith(`${root}/`)) {
    return null
  }

  if (existsSync(absolute) && statSync(absolute).isFile()) {
    return absolute
  }

  const index = join(absolute, 'index.html')
  if (existsSync(index)) {
    return index
  }

  const html = `${absolute}.html`
  if (existsSync(html) && statSync(html).isFile()) {
    return html
  }

  return null
}

createServer((request, response) => {
  const file = resolveFile(request.url)

  if (!file) {
    const notFound = join(root, '404.html')
    response.writeHead(404, { 'content-type': 'text/html; charset=utf-8' })
    if (existsSync(notFound)) {
      createReadStream(notFound).pipe(response)
      return
    }
    response.end('Not found')
    return
  }

  response.writeHead(200, {
    'content-type': types[extname(file)] || 'application/octet-stream',
  })
  createReadStream(file).pipe(response)
}).listen(port, '127.0.0.1', () => {
  console.log(`Static preview: http://127.0.0.1:${port}`)
})
