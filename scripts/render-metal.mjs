// Records the Gaming hall's metal (gaming/lib/metalBand.ts) into
// public/gaming/audio/: the intro as MP3 and the riff through the wall as a
// small WAV loop. Needs Playwright with Chromium and ffmpeg; run it after
// changing the music:  node scripts/render-metal.mjs
import { createRequire } from 'node:module';
import { execFileSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createServer } from 'vite';

const require = createRequire(import.meta.url);
const { chromium } = require('playwright');

const OUT = 'public/gaming/audio';
const RATE = 48000;

const server = await createServer({ server: { port: 5199 }, logLevel: 'error' });
await server.listen();
const browser = await chromium.launch(
  process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {}
);
const tmp = mkdtempSync(join(tmpdir(), 'metal-'));
mkdirSync(OUT, { recursive: true });
try {
  const page = await browser.newPage();
  await page.goto('http://localhost:5199/gaming/');
  for (const [name, loop] of [
    ['intro', false],
    ['wall', true],
  ]) {
    const b64 = await page.evaluate(
      async ({ rate, loop }) => {
        const { renderMetal } = await import('/gaming/lib/metalBand.ts');
        const buf = await renderMetal(rate, loop);
        const chans = [...Array(buf.numberOfChannels)].map((_, c) => buf.getChannelData(c));
        const pcm = new Int16Array(buf.length * chans.length);
        for (let i = 0; i < buf.length; i++)
          chans.forEach((d, c) => (pcm[i * chans.length + c] = Math.max(-1, Math.min(1, d[i])) * 32767));
        const bytes = new Uint8Array(pcm.buffer);
        let s = '';
        for (let i = 0; i < bytes.length; i += 0x8000) s += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
        return { data: btoa(s), channels: chans.length };
      },
      { rate: RATE, loop }
    );
    const wav = join(tmp, `${name}.wav`);
    writeFileSync(wav, wavFile(Buffer.from(b64.data, 'base64'), b64.channels, RATE));
    if (loop) {
      // Only the low end is left, so a low sample rate keeps the loop small
      // (48000 / 3 keeps it sample-exact).
      execFileSync('ffmpeg', ['-loglevel', 'error', '-y', '-i', wav, '-ar', '16000', '-c:a', 'pcm_s16le', `${OUT}/hall-metal-wall.wav`]);
    } else {
      execFileSync('ffmpeg', ['-loglevel', 'error', '-y', '-i', wav, '-c:a', 'libmp3lame', '-b:a', '160k', `${OUT}/hall-metal-intro.mp3`]);
    }
    console.log(`recorded ${name}`);
  }
} finally {
  await browser.close();
  await server.close();
}

function wavFile(pcm, channels, rate) {
  const h = Buffer.alloc(44);
  h.write('RIFF', 0);
  h.writeUInt32LE(36 + pcm.length, 4);
  h.write('WAVEfmt ', 8);
  h.writeUInt32LE(16, 16);
  h.writeUInt16LE(1, 20);
  h.writeUInt16LE(channels, 22);
  h.writeUInt32LE(rate, 24);
  h.writeUInt32LE(rate * channels * 2, 28);
  h.writeUInt16LE(channels * 2, 32);
  h.writeUInt16LE(16, 34);
  h.write('data', 36);
  h.writeUInt32LE(pcm.length, 40);
  return Buffer.concat([h, pcm]);
}
