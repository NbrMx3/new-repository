import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    // Handle stale PWA service worker requests that reference old routes
    {
      name: 'pwa-compat',
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          if (req.url === '/@vite-plugin-pwa/pwa-entry-point-loaded') {
            res.statusCode = 200
            res.setHeader('Content-Type', 'application/javascript')
            res.end('// no-op')
            return
          }
          next()
        })
      }
    }
  ],
})
