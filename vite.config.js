import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { VitePWA } from 'vite-plugin-pwa';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DEV_API_PROXY_PREFIX = '/__api';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const apiUrl = env.VITE_API_URL ?? '';

  let apiOrigin = '';
  let apiPathname = '';
  try {
    if (apiUrl) {
      const parsedApiUrl = new URL(apiUrl);
      apiOrigin = parsedApiUrl.origin;
      apiPathname = parsedApiUrl.pathname.replace(/\/+$/, '');
    }
  } catch {
    apiOrigin = '';
    apiPathname = '';
  }

  return {
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    server: {
      host: true,
      proxy: apiOrigin
        ? {
            [DEV_API_PROXY_PREFIX]: {
              target: apiOrigin,
              changeOrigin: true,
              secure: false,
              rewrite: (requestPath) => (
                `${apiPathname}${requestPath.slice(DEV_API_PROXY_PREFIX.length)}`
              ),
            },
          }
        : undefined,
    },
    preview: {
      host: true,
    },
    plugins: [
      react(),
      tailwindcss(),
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: ['favicon.svg', 'pwa-192x192.png', 'pwa-512x512.png'],
        manifest: {
          name: 'App Toko',
          short_name: 'Toko',
          description: 'Aplikasi manajemen produk toko.',
          theme_color: '#0f172a',
          background_color: '#eff6ff',
          display: 'standalone',
          start_url: './',
          scope: './',
          icons: [
            {
              src: 'pwa-192x192.png',
              sizes: '192x192',
              type: 'image/png',
              purpose: 'any',
            },
            {
              src: 'pwa-512x512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'any',
            },
            {
              src: 'pwa-512x512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'maskable',
            },
          ],
        },
        workbox: {
          cleanupOutdatedCaches: true,
          navigateFallback: '/index.html',
          runtimeCaching: [
            {
              urlPattern: ({ request, url }) => {
                if (request.method !== 'GET') return false;
                if (url.pathname.endsWith('/get_barang.php')) return true;
                return Boolean(
                  apiOrigin &&
                  url.origin === apiOrigin &&
                  url.pathname.endsWith('.php'),
                );
              },
              handler: 'NetworkFirst',
              options: {
                cacheName: 'api-toko-cache',
                networkTimeoutSeconds: 5,
                expiration: {
                  maxEntries: 20,
                  maxAgeSeconds: 60 * 60 * 24 * 7,
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
  };
});
