import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: process.env.GITHUB_ACTIONS ? '/chameleon/' : '/',
  plugins: [react()],
  server: {
    port: 5173,
    strictPort: false,
    hmr: true
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    minify: 'esbuild'
  },
  optimizeDeps: {
    include: ['phaser']
  }
})
