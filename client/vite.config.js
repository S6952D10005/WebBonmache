import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { assetSync } from './scripts/asset-sync.js'

export default defineConfig({
  // assetSync: images saved in client/asset/ are converted and the page reloads (see assets.config.js)
  plugins: [react(), tailwindcss(), assetSync()],
  server: {
    host: true, // listen on localhost, 127.0.0.1 and the LAN IP
    port: 5173,
    open: true, // open the browser at the right URL when `npm run dev` starts
    proxy: {
      '/api': 'http://localhost:5000',
    },
  },
})
