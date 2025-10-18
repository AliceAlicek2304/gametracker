import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // Proxy disabled - using production API via VITE_API_URL
    // Uncomment to use local backend
    // proxy: {
    //   '/uploads': 'http://localhost:8080',
    //   '/api': 'http://localhost:8080'
    // }
  }
})
