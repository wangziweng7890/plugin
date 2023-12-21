import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/*.ts'],
  format: ['cjs', 'esm'],
  clean: true,
  sourcemap: true,
  dts: true,
  splitting: true,
})
