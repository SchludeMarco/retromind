// Every system the filter offers. `category` is the English Wikipedia
// category listing that system's games; it feeds the live archive, so a
// filter shows hundreds of games instead of only the curated picks.

import { viaProxy } from '../../lib/privacy';
import { tr } from '../../lib/i18n';

export interface PlatformInfo {
  id: string;
  /** English Wikipedia category, without the "Category:" prefix. */
  category: string;
  color: string;
  /** Shelf in the console picker. */
  maker: Maker;
  kind: 'console' | 'handheld' | 'computer' | 'arcade';
  /** Photo of the system on Wikimedia Commons (free licence). */
  photo: string;
  from: number;
}

/** A small thumbnail of a Commons file, resolved by Commons and fetched through our server. */
export const photoUrl = (file: string, width = 240) =>
  viaProxy(`https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(file)}?width=${width}`);

export type Maker = 'Nintendo' | 'Sega' | 'Sony' | 'Microsoft' | 'Computer' | 'Spielhalle';

/** The picker's shelves, in display order. */
export const MAKERS: { id: Maker; label: string }[] = [
  { id: 'Nintendo', label: 'Nintendo' },
  { id: 'Sega', label: 'Sega' },
  { id: 'Sony', label: 'Sony' },
  { id: 'Microsoft', label: 'Microsoft' },
  { id: 'Computer', label: tr('Home Computers & PC', 'Heimcomputer & PC') },
  { id: 'Spielhalle', label: tr('Atari, Arcade & Oddballs', 'Atari, Arcade & Exoten') },
];

export const KIND_ICON: Record<PlatformInfo['kind'], string> = {
  console: '🎮',
  handheld: '🔋',
  computer: '💾',
  arcade: '🕹️',
};

export const PLATFORMS: PlatformInfo[] = [
  { id: 'Atari 2600', category: 'Atari 2600 games', color: '#a0522d', maker: 'Spielhalle', kind: 'console', photo: 'Atari-2600-Wood-4Sw-Set.png', from: 1977 },
  { id: 'C64', category: 'Commodore 64 games', color: '#8e7cc3', maker: 'Computer', kind: 'computer', photo: 'Commodore-64-Computer-FL.jpg', from: 1982 },
  { id: 'ZX Spectrum', category: 'ZX Spectrum games', color: '#d35400', maker: 'Computer', kind: 'computer', photo: 'ZXSpectrum48k.jpg', from: 1982 },
  { id: 'Arcade', category: 'Arcade video games', color: '#e84393', maker: 'Spielhalle', kind: 'arcade', photo: 'Fliperama.jpg', from: 1971 },
  { id: 'NES', category: 'Nintendo Entertainment System games', color: '#c0392b', maker: 'Nintendo', kind: 'console', photo: 'NES-Console-Set.png', from: 1983 },
  { id: 'Master System', category: 'Master System games', color: '#e74c3c', maker: 'Sega', kind: 'console', photo: 'Sega-Master-System-Set.png', from: 1985 },
  { id: 'Amiga', category: 'Amiga games', color: '#e67e22', maker: 'Computer', kind: 'computer', photo: 'Amiga500_system.jpg', from: 1985 },
  { id: 'Atari ST', category: 'Atari ST games', color: '#7f8c8d', maker: 'Computer', kind: 'computer', photo: 'Atari_1040STf.jpg', from: 1985 },
  { id: 'MS-DOS', category: 'DOS games', color: '#95a5a6', maker: 'Computer', kind: 'computer', photo: 'IBM_PC_5150.jpg', from: 1981 },
  { id: 'Mega Drive', category: 'Sega Genesis games', color: '#2d6cdf', maker: 'Sega', kind: 'console', photo: 'Sega-Mega-Drive-JP-Mk1-Console-Set.jpg', from: 1988 },
  { id: 'PC Engine', category: 'TurboGrafx-16 games', color: '#16a085', maker: 'Spielhalle', kind: 'console', photo: 'PC-Engine-Console-Set.png', from: 1987 },
  { id: 'Game Boy', category: 'Game Boy games', color: '#8bac0f', maker: 'Nintendo', kind: 'handheld', photo: 'Game-Boy-FL.png', from: 1989 },
  { id: 'Game Gear', category: 'Game Gear games', color: '#34495e', maker: 'Sega', kind: 'handheld', photo: 'Sega-Game-Gear-WB.png', from: 1990 },
  { id: 'SNES', category: 'Super Nintendo Entertainment System games', color: '#7d5fff', maker: 'Nintendo', kind: 'console', photo: 'SNES-Mod1-Console-Set.png', from: 1990 },
  { id: 'Neo Geo', category: 'Neo Geo games', color: '#b8860b', maker: 'Spielhalle', kind: 'arcade', photo: 'Neo-Geo-AES-Console-Set.png', from: 1990 },
  { id: 'Sega Saturn', category: 'Sega Saturn games', color: '#5d6d7e', maker: 'Sega', kind: 'console', photo: 'Sega-Saturn-Console-Set-Mk2.png', from: 1994 },
  { id: 'PlayStation', category: 'PlayStation (console) games', color: '#00a8a8', maker: 'Sony', kind: 'console', photo: 'PSX-Console-wController.png', from: 1994 },
  { id: 'Nintendo 64', category: 'Nintendo 64 games', color: '#27ae60', maker: 'Nintendo', kind: 'console', photo: 'Nintendo-64-wController-L.jpg', from: 1996 },
  { id: 'Game Boy Color', category: 'Game Boy Color games', color: '#9b59b6', maker: 'Nintendo', kind: 'handheld', photo: 'Nintendo-Game-Boy-Color-FL.png', from: 1998 },
  { id: 'Dreamcast', category: 'Dreamcast games', color: '#f39c12', maker: 'Sega', kind: 'console', photo: 'Dreamcast-Console-Set.png', from: 1998 },
  { id: 'PlayStation 2', category: 'PlayStation 2 games', color: '#2c3e8f', maker: 'Sony', kind: 'console', photo: 'Sony_PlayStation_2.png', from: 2000 },
  { id: 'Game Boy Advance', category: 'Game Boy Advance games', color: '#5b4bd1', maker: 'Nintendo', kind: 'handheld', photo: 'Nintendo-Game-Boy-Advance-Purple-FL.png', from: 2001 },
  { id: 'GameCube', category: 'GameCube games', color: '#6c5ce7', maker: 'Nintendo', kind: 'console', photo: 'GameCube-Console-Set.png', from: 2001 },
  { id: 'Xbox', category: 'Xbox games', color: '#2e8b57', maker: 'Microsoft', kind: 'console', photo: 'Xbox-Console-wDuke-L.png', from: 2001 },
  { id: 'Nintendo DS', category: 'Nintendo DS games', color: '#636e72', maker: 'Nintendo', kind: 'handheld', photo: 'Nintendo-DS-Fat-Blue.png', from: 2004 },
  { id: 'PSP', category: 'PlayStation Portable games', color: '#2d3436', maker: 'Sony', kind: 'handheld', photo: 'PSP-1000.png', from: 2004 },
  { id: 'Xbox 360', category: 'Xbox 360 games', color: '#3c9d3c', maker: 'Microsoft', kind: 'console', photo: 'Xbox-360-Pro-wController.jpg', from: 2005 },
  { id: 'Wii', category: 'Wii games', color: '#74b9ff', maker: 'Nintendo', kind: 'console', photo: 'Wii-Console.png', from: 2006 },
  { id: 'PlayStation 3', category: 'PlayStation 3 games', color: '#273c75', maker: 'Sony', kind: 'console', photo: 'PS3_consoles_montage_HQ.png', from: 2006 },
  { id: 'Nintendo 3DS', category: 'Nintendo 3DS games', color: '#d63031', maker: 'Nintendo', kind: 'handheld', photo: 'Nintendo-3DS-AquaOpen.png', from: 2011 },
  { id: 'PS Vita', category: 'PlayStation Vita games', color: '#1f6fb2', maker: 'Sony', kind: 'handheld', photo: 'PlayStation-Vita-1101-FL.png', from: 2011 },
  { id: 'Wii U', category: 'Wii U games', color: '#0984e3', maker: 'Nintendo', kind: 'console', photo: 'Wii_U_Console_and_Gamepad.png', from: 2012 },
  { id: 'PlayStation 4', category: 'PlayStation 4 games', color: '#192a56', maker: 'Sony', kind: 'console', photo: 'PS4_consoles_montage.jpg', from: 2013 },
  { id: 'Xbox One', category: 'Xbox One games', color: '#107c10', maker: 'Microsoft', kind: 'console', photo: 'Xbox_One_consoles_montage.png', from: 2013 },
  { id: 'Switch', category: 'Nintendo Switch games', color: '#e60012', maker: 'Nintendo', kind: 'console', photo: 'Nintendo-Switch-wJoyCons-BlRd-Standing-FL.jpg', from: 2017 },
  { id: 'Windows', category: 'Windows games', color: '#0078d7', maker: 'Computer', kind: 'computer', photo: 'MSI-Gaming-PC_2024-09-30.png', from: 1990 },
];

export const platformInfo = (id: string) => PLATFORMS.find((p) => p.id === id);

/**
 * Display name of a platform id. The catalog and the live archive use a few
 * German pseudo-platforms as ids ('Multiplattform', 'Fundstück', 'Archiv');
 * they stay as ids (compared in code, stored in saves), only the label is
 * localized. Every other id is a real system name and shown as is.
 */
const SPECIAL_PLATFORM_LABELS: Record<string, string> = {
  Multiplattform: tr('Multiplatform', 'Multiplattform'),
  Fundstück: tr('Lucky Find', 'Fundstück'),
  Archiv: tr('Archive', 'Archiv'),
};
export const platformLabel = (id: string) => SPECIAL_PLATFORM_LABELS[id] ?? id;
