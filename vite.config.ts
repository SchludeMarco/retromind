import path from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { execSync } from 'child_process';
import { version } from './package.json';

// The version shown in both apps' settings: "<major>.<PR number>", e.g.
// "2.167", plus the short commit so a build can be matched to a deployment.
// On Vercel the merge commit's message carries the PR number ("… (#167)");
// locally (no PR number) it falls back to the package.json version.
function buildVersion() {
  const git = (cmd: string) => {
    try {
      return execSync(cmd, { stdio: ['ignore', 'pipe', 'ignore'] }).toString().trim();
    } catch {
      return '';
    }
  };
  const message = process.env.VERCEL_GIT_COMMIT_MESSAGE || git('git log -1 --format=%s');
  const sha = (process.env.VERCEL_GIT_COMMIT_SHA || git('git rev-parse HEAD')).slice(0, 7);
  const pr = message.match(/\(#(\d+)\)|pull request #(\d+)/);
  const number = pr ? `${version.split('.')[0]}.${pr[1] || pr[2]}` : version;
  return sha ? `${number} (${sha})` : number;
}

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
    __APP_VERSION__: JSON.stringify(buildVersion()),
  },
});
