import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/devices": "http://localhost:8001",
    },
    hmr: {
      host: '10.0.0.247',
    },
  },
})
