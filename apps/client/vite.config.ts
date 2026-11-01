import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'
import { defineConfig } from 'vite'

export default defineConfig({
  base: '/7-de-trebol/',
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'auto',
      useCredentials: true,
      devOptions: { enabled: true, type: 'module' },
      includeAssets: ['favicon.svg', 'apple-touch-icon.png'],
      manifest: {
        name: '7 de Trébol',
        short_name: '7 de Trébol',
        description: 'Juego de naipes Cocktail contra bots.',
        lang: 'es',
        theme_color: '#10211a',
        background_color: '#10211a',
        display: 'standalone',
        icons: [
          { src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png' },
          { src: 'maskable-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
    }),
  ],
})
