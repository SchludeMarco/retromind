// What a link between the two RetroMind domains carries along in its
// #fragment (fragments never reach a server): the Google sign-in
// (lib/googleLogin.ts) and the data kept on this device (lib/sync.ts), as
// "#rm_google=…&rm_data=…". The fragment is read and removed from the address
// bar once, when the page starts; each module then takes its own part.

const parts: Record<string, string> = readFragment();
const writers: Record<string, () => string | null> = {};

function readFragment(): Record<string, string> {
  const out: Record<string, string> = {};
  try {
    const hash = window.location.hash.slice(1);
    if (!hash.startsWith('rm_')) return out;
    for (const pair of hash.split('&')) {
      const i = pair.indexOf('=');
      if (i > 0) out[pair.slice(0, i)] = pair.slice(i + 1);
    }
    window.history.replaceState(window.history.state, '', window.location.pathname + window.location.search);
  } catch {
    /* no window/URL support — nothing handed over */
  }
  return out;
}

/** The part of the incoming fragment with this name (e.g. "rm_google"), once. */
export function takeHandoff(name: string): string | null {
  const value = parts[name] ?? null;
  delete parts[name];
  return value;
}

/** Registers what a module adds to links to the other domain (null = nothing). */
export function addHandoffPart(name: string, write: () => string | null) {
  writers[name] = write;
}

/** The fragment for a link to the other domain, "" when there is nothing to carry. */
export function handoffFragment(): string {
  const out: string[] = [];
  for (const [name, write] of Object.entries(writers)) {
    try {
      const value = write();
      if (value) out.push(`${name}=${value}`);
    } catch {
      /* a part that can't be written is simply left out */
    }
  }
  return out.length ? `#${out.join('&')}` : '';
}

export function toB64url(s: string): string {
  return bytesToB64url(new TextEncoder().encode(s));
}

export function fromB64url(s: string): string {
  return new TextDecoder().decode(b64urlToBytes(s));
}

export function bytesToB64url(bytes: Uint8Array): string {
  let bin = '';
  for (let i = 0; i < bytes.length; i += 0x8000) bin += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

export function b64urlToBytes(s: string): Uint8Array {
  return Uint8Array.from(atob(s.replace(/-/g, '+').replace(/_/g, '/')), (c) => c.charCodeAt(0));
}
