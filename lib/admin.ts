import { useRef } from 'react';
import type { GoogleUser } from '../types';

// The admin area (/admin/) is not linked anywhere in the apps. Marco opens it
// by its address or with a hidden gesture: five quick taps on the settings
// heading (useSecretAdminTaps). The real check happens on the server
// (api/stats.js verifies the Google token); this only lets the page tell
// Marco to sign in again.
export const ADMIN_EMAIL = 'marco.schlude@gmail.com';
const ADMIN_URL = '/admin/';
const TAPS = 5;
const WINDOW_MS = 2500;

export const isAdminUser = (user: GoogleUser | null | undefined) =>
  !!user?.email && user.email.toLowerCase() === ADMIN_EMAIL;

/** onClick handler for a heading: five taps within a few seconds open the admin area. */
export function useSecretAdminTaps() {
  const taps = useRef<number[]>([]);
  return () => {
    const now = Date.now();
    taps.current = [...taps.current.filter((t) => now - t < WINDOW_MS), now];
    if (taps.current.length >= TAPS) {
      taps.current = [];
      window.location.href = ADMIN_URL;
    }
  };
}
