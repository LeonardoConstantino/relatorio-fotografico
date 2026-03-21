import { defineConfig } from 'vitest/config';
import tailwindcss from '@tailwindcss/vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  base: '/relatorio-fotografico/',
  plugins: [
    tailwindcss(),
    VitePWA({
      registerType: 'prompt', // 'prompt' para usarmos nossa UI de notificação
      devOptions: {
        enabled: false, // Desativado em DEV para não salvar caches chatos
        type: 'module',
        suppressWarnings: true,
      },
      manifest: {
        name: 'Aura Technical | Relatórios',
        short_name: 'Aura Tech',
        description: 'Gerador de Relatórios Fotográficos Profissionais',
        theme_color: '#0a0a0b',
        background_color: '#0a0a0b',
        display: 'standalone',
        orientation: 'portrait',
        icons: [
          {
            src: './img/android-icon-36x36.png',
            sizes: '36x36',
            type: 'image\/png',
            purpose: 'any',
          },
          {
            src: './img/android-icon-48x48.png',
            sizes: '48x48',
            type: 'image\/png',
            purpose: 'any',
          },
          {
            src: './img/android-icon-72x72.png',
            sizes: '72x72',
            type: 'image\/png',
            purpose: 'any',
          },
          {
            src: './img/android-icon-96x96.png',
            sizes: '96x96',
            type: 'image\/png',
            purpose: 'any',
          },
          {
            src: './img/android-icon-144x144.png',
            sizes: '144x144',
            type: 'image\/png',
            purpose: 'any',
          },
          {
            src: './img/android-icon-192x192.png',
            sizes: '192x192',
            type: 'image\/png',
            purpose: 'maskable',
          },
        ],
        screenshots: [
          {
            src: './img/desktop-screenshot_1280x720.png',
            sizes: '1280x720',
            type: 'image/png',
            form_factor: 'wide',
            label: 'Desktop view of Inventory Control',
          },
          {
            src: './img/mobile-screenshot_375x812.png',
            sizes: '375x812',
            type: 'image/png',
            label: 'Mobile view of Inventory Control',
          },
        ],
      },

      includeAssets: ['favicon.ico'],

      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365, // 1 ano
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
        ],
      },
    }),
  ],
  test: {
    environment: 'jsdom',
    globals: true,
  },
});
