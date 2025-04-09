import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0', // Listen on all interfaces
    port: 5173,       // Make sure this matches your exposed port (if different from default)
    watch: {
      usePolling: true // Required for hot reload in some docker setups
    }
  },
})
