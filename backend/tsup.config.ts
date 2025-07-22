import { defineConfig } from 'tsup'
import { fixImportsPlugin } from 'esbuild-fix-imports-plugin'

export default defineConfig({
  entry: ['src/**/*.ts'],
  format: ['esm'],
  external: ['node:*'],
  splitting: false,
  clean: true,
  dts: true,
  target: 'node20',
  platform: 'node',
  outDir: 'dist',
  bundle: false,
  treeshake: true,
  tsconfig: './prod.tsconfig.json',
  esbuildPlugins: [fixImportsPlugin()],
  sourcemap: 'inline',
  esbuildOptions: (options) => {
    options.banner = { js: '"use strict";' }
  },
  outExtension: () => ({ js: '.js' }),
})
