import { defineConfig, globalIgnores } from 'eslint/config'
import nextVitals from 'eslint-config-next/core-web-vitals'
import nextTs from 'eslint-config-next/typescript'
import neostandard from 'neostandard'
import customRules from './eslint.custom.mjs'

const eslintConfig = defineConfig([
  ...neostandard(),
  ...nextVitals,
  ...nextTs,
  customRules,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    '.next/**',
    'out/**',
    'build/**',
    'next-env.d.ts',
  ]),
])

export default eslintConfig
