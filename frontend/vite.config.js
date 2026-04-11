import {
  defineConfig
} from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'


// Backend default PORT is 5000 (see backend/.env.example). Proxy must match or you get 502 from Vite.
const apiProxyTarget =
  process.env.VITE_API_PROXY_TARGET || 'http://127.0.0.1:5000'

// https://vite.dev/config/
const apiProxy = {
  '/api': {
    target: apiProxyTarget,
    changeOrigin: true,
  },
}

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 3000,
    proxy: apiProxy,
  },
  preview: {
    proxy: apiProxy,
  },
})