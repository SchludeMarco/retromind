// Writes gaming/CHANGELOG.md from the main CHANGELOG.md, so the Gaming
// edition has its own changelog without a second list to keep by hand.
// An entry counts as Gaming when it names the edition, the hall or one of
// its parts, or applies to both apps. Run `npm run changelog:gaming` after
// adding entries to CHANGELOG.md.
import { readFileSync, writeFileSync } from 'node:fs';

const GAMING =
  /Gaming|Spielhalle|Halle|Arcade|Chill-Ecke|Retro-Guru|Pac-Man|Pac-Mampf|Easter Egg|Coins|Spielmarken|Konsole|Modul einlegen|Club|Highscore|Eingang|beide(n|r)? (Apps|Editionen|Domains)|alle(n)? Modul|Spotify-Premium-Anmeldung/;
// Zeitreise entries that only mention Gaming in passing (such as the signpost
// on its start page), and entries about the repository itself.
const SKIP = /^- \*\*(Zeitreise\b|Dokumentation\b|Entwicklung\b|[^*]*Wegweiser)/;

const source = readFileSync('CHANGELOG.md', 'utf8');
const out = [
  '# Changelog: RetroMind – Gaming',
  '',
  'Alle Änderungen an der Gaming-Edition (https://retromind-gaming.vercel.app),',
  'die neueste oben. Diese Datei wird mit `npm run changelog:gaming` aus der',
  '[CHANGELOG.md](../CHANGELOG.md) im Hauptordner erzeugt, die alle Änderungen',
  'an beiden Apps enthält. Bitte nicht von Hand bearbeiten.',
];

let section = null;
let printed = null;
let entry = null;
const flush = () => {
  if (!entry) return;
  const text = entry.join('\n');
  if (GAMING.test(text) && !SKIP.test(text)) {
    if (printed !== section) {
      out.push('', `## ${section}`);
      printed = section;
    }
    out.push('', text);
  }
  entry = null;
};

for (const line of source.split('\n')) {
  const heading = line.match(/^## (.+)$/);
  if (heading) {
    flush();
    section = heading[1].trim();
  } else if (!section) {
    continue;
  } else if (line.startsWith('- ')) {
    flush();
    entry = [line];
  } else if (entry && /^\s+\S/.test(line)) {
    entry.push(line);
  } else {
    flush();
  }
}
flush();

writeFileSync('gaming/CHANGELOG.md', `${out.join('\n')}\n`);
console.log('gaming/CHANGELOG.md written');
