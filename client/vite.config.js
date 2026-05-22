import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // amazon-cognito-identity-js expects Node's `global` in the browser
  define: {
    global: 'globalThis',
  },
})
