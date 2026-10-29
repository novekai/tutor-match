import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    // Le build est servi par Laravel : on écrit dans backend/public sans le vider
    // (il contient index.php, favicon.ico, robots.txt).
    outDir: '../backend/public',
    emptyOutDir: false,
    assetsDir: 'assets',
    rolldownOptions: {
      output: {
        // Bibliothèques dans un bloc séparé (mis en cache indépendamment du code applicatif).
        codeSplitting: {
          groups: [
            { name: 'react', test: /node_modules[\\/](react|react-dom|react-router|react-router-dom|scheduler)[\\/]/ },
            { name: 'vendor', test: /node_modules[\\/]/ },
          ],
        },
      },
    },
  },
  server: {
    proxy: {
      '/api': {
        target: 'https://tutor-match.187-124-218-227.sslip.io',
        changeOrigin: true,
        secure: false,
      },
    },
  },
})
