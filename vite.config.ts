import path from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// The Gemini API key is NOT exposed to the client anymore — all AI calls go
// through the serverless functions in /api (see api/gemini.js). For local
// development of those functions run `vercel dev` instead of `vite dev`.
export default defineConfig({
  server: {
    port: 3000,
    host: '0.0.0.0',
  },
  // Tailwind is compiled at build time (not loaded from the Play CDN at
  // runtime) so the UI still renders correctly if that CDN is slow, blocked
  // by an ad-/script-blocker, or unreachable.
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    },
  },
});
