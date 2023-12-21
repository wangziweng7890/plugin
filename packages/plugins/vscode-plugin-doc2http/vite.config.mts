// import { sveltekit } from '@sveltejs/kit/vite';
import { svelte } from '@sveltejs/vite-plugin-svelte'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [
    // sveltekit(),
    svelte(),
  ],
  build: {
    outDir: 'dist2',
  },
})
