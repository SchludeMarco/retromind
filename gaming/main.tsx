import { bootSync } from '../lib/sync';

// Brings this device's RetroMind data up to date (the Zeitreise, the Google
// Drive copy) before the app's modules read it, then starts the app.
bootSync('gaming').finally(() => import('./start'));
