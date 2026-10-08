import type { GoogleUser } from '../types';

// The admin area (/admin/) is not linked anywhere in the apps; Marco opens it
// by its address. The real check happens on the server (api/stats.js verifies
// the Google token); this only lets the page tell Marco to sign in again.
export const ADMIN_EMAIL = 'marco.schlude@gmail.com';

export const isAdminUser = (user: GoogleUser | null | undefined) =>
  !!user?.email && user.email.toLowerCase() === ADMIN_EMAIL;
