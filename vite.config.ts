import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import cors from '@fastify/cors'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    cors: true,
    hmr: {
      // Allow CORS for HMR through cloudflare tunnel
      clientPort: 443, 
      host: 'prominent-avenue-needs-assuming.trycloudflare.com'
    },
    watch: {
      // Use polling for file changes to make HMR work better with cloudflare tunnel
      usePolling: true
    },
    strictPort: true, // Don't try another port if 5173 is in use
    allowedHosts: ['localhost', 'prominent-avenue-needs-assuming.trycloudflare.com', '.trycloudflare.com'],
    proxy: {
      '/api': {
        target: 'https://api.warpcast.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
        configure: (proxy, _options) => {
          proxy.on('error', (err, _req, _res) => {
            console.log('proxy error', err);
          });
          proxy.on('proxyReq', (proxyReq, req, _res) => {
            console.log('Sending Request to the Target:', req.method, req.url);
          });
          proxy.on('proxyRes', (proxyRes, req, _res) => {
            console.log('Received Response from the Target:', proxyRes.statusCode, req.url);
          });
        },
      }
    }
  }
})