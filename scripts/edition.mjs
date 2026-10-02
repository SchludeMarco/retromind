// Post-build step for Vercel. The `retromind-gaming` project sets
// RETROMIND_EDITION=gaming, so its deployment serves the Gaming edition at
// the root of its own domain. /gaming/ keeps working there too, and the main
// `retromind` project (no variable set) is left untouched.
import { copyFileSync } from 'node:fs';

if (process.env.RETROMIND_EDITION === 'gaming') {
  copyFileSync('dist/gaming/index.html', 'dist/index.html');
  console.log('RetroMind edition: gaming → serving gaming/index.html at /');
}
