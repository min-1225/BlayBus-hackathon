import { fileURLToPath, URL } from 'node:url'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  // 개발 중에는 API_BASE_URL 을 비워두고 상대경로(/api/v1/...)로 호출한다.
  // 그 상대경로를 여기서 Backend 로 넘겨주므로 로컬에서 CORS 문제가 생기지 않는다.
  const proxyTarget = env.VITE_DEV_PROXY_TARGET || 'http://localhost:8080'

  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
    server: {
      port: 5173,
      strictPort: true,
      proxy: {
        '/api': { target: proxyTarget, changeOrigin: true },
        '/ws': { target: proxyTarget, changeOrigin: true, ws: true },
      },
    },
  }
})
