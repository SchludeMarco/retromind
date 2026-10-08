import type { GoogleUser } from '../types';

// Only this Google account sees the link to the admin area. The real check
// happens on the server (api/stats.js verifies the Google token), this just
// keeps the link out of everyone else's settings.
export const ADMIN_EMAIL = 'marco.schlude@gmail.com';
export const ADMIN_URL = '/admin/';

export const isAdminUser = (user: GoogleUser | null | undefined) =>
  !!user?.email && user.email.toLowerCase() === ADMIN_EMAIL;
