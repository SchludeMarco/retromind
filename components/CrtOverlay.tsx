import React from 'react';

// A fixed, screen-wide pane that sits above the whole app from the moment it
// mounts: faint scanlines and a vignette tint it old, and a slight permanent
// backdrop blur/wash softens everything behind it. Every so often it also
// dips into a brief flicker/tear, like an old CRT losing sync for a beat.
// Purely decorative (aria-hidden, pointer-events: none) so it never blocks
// interaction with the app underneath.
export const CrtOverlay: React.FC = () => <div aria-hidden="true" className="crt-overlay" />;
