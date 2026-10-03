import { viaProxy } from './privacy';

// UI sound effects, loaded through our own server (see lib/privacy.ts).
export const SFX = {
  click: viaProxy('https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3'),
  transition: viaProxy('https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3'),
  success: viaProxy('https://assets.mixkit.co/active_storage/sfx/2000/2000-preview.mp3'),
};
