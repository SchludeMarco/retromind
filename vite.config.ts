import path from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { version } from './package.json';

// The Gemini API key is NOT exposed to the client anymore — all AI calls go
// through the serverless functions in /api (see api/gemini.js). For local
// development of those functions run `vercel dev` instead of `vite dev`.
export default defineConfig({
  server: {
    port: 3000,
    host: '0.0.0.0',
  },
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    },
  },
  build: {
    // Three pages: the RetroMind journey at /, the Gaming edition at /gaming/
    // and the admin area (usage numbers, only for Marco) at /admin/.
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, 'index.html'),
        gaming: path.resolve(__dirname, 'gaming/index.html'),
        admin: path.resolve(__dirname, 'admin/index.html'),
      },
    },
  },
  define: {
    __APP_VERSION__: JSON.stringify(version),
  },
});
