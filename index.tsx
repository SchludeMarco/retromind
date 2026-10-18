// Catches Android's install prompt before anything else loads (lib/install.ts).
import './lib/install';
import { bootSync } from './lib/sync';

// Brings this device's RetroMind data up to date (the Gaming edition, the
// Google Drive copy) before the app's modules read it, then starts the app.
bootSync('zeitreise').finally(() => import('./start'));
