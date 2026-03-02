import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // MiniMax AI proxy
      '/api/minimax': {
        target: 'https://api.minimax.chat/v1',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/minimax/, '')
      },
      // Backend API proxy - forwards to local backend server
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true
      }
    }
  }
})
