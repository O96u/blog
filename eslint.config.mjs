// @ts-check
import withNuxt from './.nuxt/eslint.config.mjs'
import prettier from 'eslint-config-prettier'

export default withNuxt(
  {
    ignores: ['.output/**', 'dist/**', 'coverage/**', 'test-results/**', 'playwright-report/**'],
  },
  prettier,
)
