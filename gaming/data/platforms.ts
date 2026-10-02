// Every system the filter offers. `category` is the English Wikipedia
// category listing that system's games; it feeds the live archive, so a
// filter shows hundreds of games instead of only the curated picks.

export interface PlatformInfo {
  id: string;
  /** English Wikipedia category, without the "Category:" prefix. */
  category: string;
  color: string;
  from: number;
}

export const PLATFORMS: PlatformInfo[] = [
  { id: 'Atari 2600', category: 'Atari 2600 games', color: '#a0522d', from: 1977 },
  { id: 'C64', category: 'Commodore 64 games', color: '#8e7cc3', from: 1982 },
  { id: 'ZX Spectrum', category: 'ZX Spectrum games', color: '#d35400', from: 1982 },
  { id: 'Arcade', category: 'Arcade video games', color: '#e84393', from: 1978 },
  { id: 'NES', category: 'Nintendo Entertainment System games', color: '#c0392b', from: 1983 },
  { id: 'Master System', category: 'Master System games', color: '#e74c3c', from: 1985 },
  { id: 'Amiga', category: 'Amiga games', color: '#e67e22', from: 1985 },
  { id: 'Atari ST', category: 'Atari ST games', color: '#7f8c8d', from: 1985 },
  { id: 'MS-DOS', category: 'DOS games', color: '#95a5a6', from: 1981 },
  { id: 'Mega Drive', category: 'Sega Genesis games', color: '#2d6cdf', from: 1988 },
  { id: 'PC Engine', category: 'TurboGrafx-16 games', color: '#16a085', from: 1987 },
  { id: 'Game Boy', category: 'Game Boy games', color: '#8bac0f', from: 1989 },
  { id: 'Game Gear', category: 'Game Gear games', color: '#34495e', from: 1990 },
  { id: 'SNES', category: 'Super Nintendo Entertainment System games', color: '#7d5fff', from: 1990 },
  { id: 'Neo Geo', category: 'Neo Geo games', color: '#b8860b', from: 1990 },
  { id: 'Sega Saturn', category: 'Sega Saturn games', color: '#5d6d7e', from: 1994 },
  { id: 'PlayStation', category: 'PlayStation (console) games', color: '#00a8a8', from: 1994 },
  { id: 'Nintendo 64', category: 'Nintendo 64 games', color: '#27ae60', from: 1996 },
  { id: 'Game Boy Color', category: 'Game Boy Color games', color: '#9b59b6', from: 1998 },
  { id: 'Dreamcast', category: 'Dreamcast games', color: '#f39c12', from: 1998 },
  { id: 'PlayStation 2', category: 'PlayStation 2 games', color: '#2c3e8f', from: 2000 },
  { id: 'Game Boy Advance', category: 'Game Boy Advance games', color: '#5b4bd1', from: 2001 },
  { id: 'GameCube', category: 'GameCube games', color: '#6c5ce7', from: 2001 },
  { id: 'Xbox', category: 'Xbox games', color: '#2e8b57', from: 2001 },
  { id: 'Nintendo DS', category: 'Nintendo DS games', color: '#636e72', from: 2004 },
  { id: 'PSP', category: 'PlayStation Portable games', color: '#2d3436', from: 2004 },
  { id: 'Xbox 360', category: 'Xbox 360 games', color: '#3c9d3c', from: 2005 },
  { id: 'Wii', category: 'Wii games', color: '#74b9ff', from: 2006 },
  { id: 'PlayStation 3', category: 'PlayStation 3 games', color: '#273c75', from: 2006 },
  { id: 'Nintendo 3DS', category: 'Nintendo 3DS games', color: '#d63031', from: 2011 },
  { id: 'PS Vita', category: 'PlayStation Vita games', color: '#1f6fb2', from: 2011 },
  { id: 'Wii U', category: 'Wii U games', color: '#0984e3', from: 2012 },
  { id: 'PlayStation 4', category: 'PlayStation 4 games', color: '#192a56', from: 2013 },
  { id: 'Xbox One', category: 'Xbox One games', color: '#107c10', from: 2013 },
  { id: 'Switch', category: 'Nintendo Switch games', color: '#e60012', from: 2017 },
  { id: 'Windows', category: 'Windows games', color: '#0078d7', from: 1990 },
];

export const platformInfo = (id: string) => PLATFORMS.find((p) => p.id === id);
