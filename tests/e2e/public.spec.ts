import { expect, test } from '@playwright/test'

test('home links to a published article', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('heading', { name: '写代码，也记录思考。' })).toBeVisible()
  await page
    .getByRole('region', { name: '精选推荐' })
    .getByRole('heading', { name: 'Phase 0 综合验证' })
    .click()
  await expect(page).toHaveURL(/\/posts\/phase-0-proof$/)
  await expect(page.getByText('Phase 0 静态生成验证正文')).toBeVisible()
})

test('article url survives a reload and renders math', async ({ page }) => {
  await page.goto('/posts/phase-0-proof')
  await page.reload()
  await expect(page.getByRole('heading', { level: 1, name: 'Phase 0 综合验证' })).toBeVisible()
  await expect(page.locator('.katex').first()).toBeVisible()
  await expect(page.locator('.mermaid-figure svg, .mermaid-figure .mermaid').first()).toBeVisible({
    timeout: 15_000,
  })
})

test('search page is noindex and can find Chinese text', async ({ page }) => {
  await page.goto('/search')
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', /noindex/)
  await page.getByRole('searchbox', { name: '搜索文章' }).fill('静态生成')
  await expect(page.getByRole('link', { name: 'Phase 0 综合验证' })).toBeVisible()
})

test('missing article is not a successful empty page', async ({ request }) => {
  const response = await request.get('/posts/missing-article')
  expect(response.status()).toBe(404)
})

test('dark mode toggles the document class', async ({ page }) => {
  await page.goto('/posts')
  const html = page.locator('html')
  const toDark = page.getByRole('button', { name: '深色' })
  if (await toDark.isVisible()) {
    await toDark.click()
  } else {
    await page.getByRole('button', { name: '浅色' }).click()
    await expect(html).not.toHaveClass(/dark/)
    await page.getByRole('button', { name: '深色' }).click()
  }
  await expect(html).toHaveClass(/dark/)
})
