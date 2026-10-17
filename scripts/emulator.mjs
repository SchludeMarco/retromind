// Post-build step: puts the browser emulator (EmulatorJS, GPL-3.0) into
// dist/emulator/data, served from our own domain so no visitor's address goes
// to a third party. The npm packages are fetched as plain tarballs here instead
// of being dependencies: @emulatorjs/emulatorjs pulls in every core (~300 MB)
// as an optional dependency. The download is kept in node_modules/.cache, which
// Vercel keeps between builds.
//
// Only the cores for the systems in gaming/lib/emulator.ts are shipped, each in
// its WebGL 2 and its legacy build (no thread builds: those need
// cross-origin isolation, which the app does not have).
import { execFileSync } from 'node:child_process';
import { cpSync, existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const VERSION = '4.2.3';
const CORES = ['fceumm', 'snes9x', 'gambatte', 'mgba', 'genesis_plus_gx', 'stella2014', 'mednafen_pce'];
// The order loader.js would load the separate sources in.
const SOURCES = ['emulator.js', 'nipplejs.js', 'shaders.js', 'storage.js', 'gamepad.js', 'GameManager.js', 'socket.io.min.js', 'compression.js'];

const cache = path.resolve('node_modules/.cache/emulatorjs', VERSION);
const out = path.resolve('dist/emulator/data');

function unpack(pkg) {
  const dir = path.join(cache, pkg.replace('/', '__'));
  if (existsSync(path.join(dir, 'package', 'package.json'))) return path.join(dir, 'package');
  rmSync(dir, { recursive: true, force: true });
  mkdirSync(dir, { recursive: true });
  const file = execFileSync('npm', ['pack', `${pkg}@${VERSION}`, '--silent', '--pack-destination', dir], { encoding: 'utf8' }).trim().split('\n').pop();
  execFileSync('tar', ['xzf', path.join(dir, file), '-C', dir]);
  rmSync(path.join(dir, file));
  return path.join(dir, 'package');
}

if (!existsSync('dist')) throw new Error('Run vite build first.');
rmSync(out, { recursive: true, force: true });

const ejs = path.join(unpack('@emulatorjs/emulatorjs'), 'data');
mkdirSync(path.join(out, 'cores', 'reports'), { recursive: true });
cpSync(path.join(ejs, 'loader.js'), path.join(out, 'loader.js'));
cpSync(path.join(ejs, 'compression'), path.join(out, 'compression'), { recursive: true });
cpSync(path.join(ejs, 'localization'), path.join(out, 'localization'), { recursive: true });
// The npm package ships no minified bundle. loader.js only takes the separate
// sources in debug mode (which also phones home for updates), so the sources
// are joined into the file it asks for first.
let bundle = SOURCES.map((f) => readFileSync(path.join(ejs, 'src', f), 'utf8')).join(';\n');
// 4.2.3 bug: a touch that arrives before the game starts adds the touch menu
// settings, but the menu button they style only exists when the device
// reported a touch screen up front, so the start fails.
const BUG = 'this.elements.menuToggle.style.display = "";';
if (!bundle.includes(BUG)) throw new Error('EmulatorJS changed: check the menuToggle patch.');
bundle = bundle.replace(`} else if (option === "menu-bar-button") {\n            ${BUG}`, `} else if (option === "menu-bar-button" && this.elements.menuToggle) {\n            ${BUG}`);
if (!bundle.includes('option === "menu-bar-button" && this.elements.menuToggle')) throw new Error('menuToggle patch did not apply.');
writeFileSync(path.join(out, 'emulator.min.js'), bundle);
cpSync(path.join(ejs, 'emulator.css'), path.join(out, 'emulator.min.css'));

for (const core of CORES) {
  const dir = unpack(`@emulatorjs/core-${core}`);
  for (const f of [`${core}-wasm.data`, `${core}-legacy-wasm.data`]) cpSync(path.join(dir, f), path.join(out, 'cores', f));
  cpSync(path.join(dir, 'reports', `${core}.json`), path.join(out, 'cores', 'reports', `${core}.json`));
}
console.log(`EmulatorJS ${VERSION}: ${CORES.length} cores → dist/emulator/data`);
