import { defineConfig, globalIgnores } from 'eslint/config'
import nextVitals from 'eslint-config-next/core-web-vitals'

const eslintConfig = defineConfig([
  ...nextVitals,
  {
    rules: {
      // Customize rules as needed
      // Example: Disable rules that may be too strict for your project
      // 'react/no-unescaped-entities': 'off',
      // '@next/next/no-page-custom-font': 'off',
    },
  },
  // Override default ignores of eslint-config-next
  globalIgnores([
    // Default ignores of eslint-config-next:
    '.next/**',
    'out/**',
    'build/**',
    'next-env.d.ts',
    // Additional ignores:
    'node_modules/**',
    '.turbo/**',
    'dist/**',
  ]),
])

export default eslintConfig
