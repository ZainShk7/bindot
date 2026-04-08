import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Same-origin requests in dev → no CORS. Frontend uses relative `/api/...` when VITE_API_URL is unset.
      '/api': {
        target: 'http://127.0.0.1:5050',
        changeOrigin: true,
      },
      '/health': {
        target: 'http://127.0.0.1:5050',
        changeOrigin: true,
      },
    },
  },
})
