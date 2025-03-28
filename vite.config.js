import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'node:path' // ← 改這裡！推薦用 node:path

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
