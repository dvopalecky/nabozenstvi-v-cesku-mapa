import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'

// https://vitejs.dev/config/
export default defineConfig({
  base: '/nabozenstvi-v-cesku-mapa/',
  plugins: [svelte()],
})
