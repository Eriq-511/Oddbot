import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

export default defineConfig(({ mode }) => {
  const isEmbed = mode === 'embed'

  return {
    plugins: [react()],
    server: {
      port: 5173,
    },
    build: isEmbed
      ? {
          // Embed build: single self-contained JS file for oddshoes.dev
          outDir: 'dist-embed',
          lib: {
            entry: resolve(__dirname, 'src/embed.jsx'),
            name: 'OddBot',
            fileName: 'embed',
            formats: ['iife'],
          },
          rollupOptions: {
            external: [],
          },
        }
      : {
          outDir: 'dist',
          sourcemap: false,
          rollupOptions: {
            output: {
              manualChunks: {
                vendor: ['react', 'react-dom'],
                motion: ['framer-motion'],
              },
            },
          },
        },
  }
})
