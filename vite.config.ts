import path from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// The Gemini API key is NOT exposed to the client anymore — all AI calls go
// through the serverless functions in /api (see api/gemini.js). For local
// development of those functions run `vercel dev` instead of `vite dev`.
export default defineConfig({
  server: {
    port: 3000,
    host: '0.0.0.0',
  },
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    },
  },
});
