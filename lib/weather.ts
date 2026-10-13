import { useEffect, useState, useSyncExternalStore } from 'react';
import { getLang, tr } from './i18n';
import { viaProxy } from './privacy';

// Real weather in the living-room window (components/CozyRoom.tsx, Marco,
// 2026-10-13: "Wenn es schneit oder regnet soll das entsprechend im Fenster
// sichtbar sein"). Off until the person switches it on and gives a place,
// either their rough location (the browser asks) or a town they type in.
// The place is rounded to about 10 km and stays on this device; the weather
// itself comes from Open-Meteo (free, no key) through our own proxy, so the
// browser never contacts Open-Meteo.

export type WeatherKind = 'clear' | 'clouds' | 'fog' | 'rain' | 'snow' | 'storm';

export interface WeatherPlace {
  lat: number;
  lon: number;
  name: string;
}

const KEY = 'retromind.weather';
const CACHE_KEY = 'retromind.weather.now';
const CACHE_MS = 15 * 60 * 1000;

const listeners = new Set<() => void>();
let place: WeatherPlace | null = read();

function read(): WeatherPlace | null {
  try {
    const p = JSON.parse(localStorage.getItem(KEY) || 'null');
    return p && typeof p.lat === 'number' && typeof p.lon === 'number' && typeof p.name === 'string' ? p : null;
  } catch {
    return null;
  }
}

const round = (n: number) => Math.round(n * 10) / 10;

export function setWeatherPlace(next: WeatherPlace | null) {
  place = next && { lat: round(next.lat), lon: round(next.lon), name: next.name };
  try {
    if (place) localStorage.setItem(KEY, JSON.stringify(place));
    else localStorage.removeItem(KEY);
    sessionStorage.removeItem(CACHE_KEY);
  } catch {
    /* storage unavailable — holds for this visit */
  }
  listeners.forEach((fn) => fn());
}

function subscribe(fn: () => void) {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
}

export function useWeatherPlace(): WeatherPlace | null {
  return useSyncExternalStore(subscribe, () => place, () => null);
}

/** WMO weather codes (Open-Meteo's `weather_code`) to what the window shows. */
export function weatherKind(code: number): WeatherKind {
  if (code >= 95) return 'storm';
  if ((code >= 71 && code <= 77) || code === 85 || code === 86) return 'snow';
  if ((code >= 51 && code <= 67) || (code >= 80 && code <= 82)) return 'rain';
  if (code === 45 || code === 48) return 'fog';
  if (code >= 2) return 'clouds';
  return 'clear';
}

async function fetchJson(url: string) {
  const res = await fetch(viaProxy(url));
  if (!res.ok) throw new Error(`weather ${res.status}`);
  return res.json();
}

/** The weather in the window right now, or null while off or unknown. */
export function useWindowWeather(): WeatherKind | null {
  const p = useWeatherPlace();
  const [kind, setKind] = useState<WeatherKind | null>(null);
  useEffect(() => {
    if (!p) {
      setKind(null);
      return;
    }
    const tag = `${p.lat},${p.lon}`;
    try {
      const cached = JSON.parse(sessionStorage.getItem(CACHE_KEY) || 'null');
      if (cached && cached.tag === tag && Date.now() - cached.at < CACHE_MS) {
        setKind(cached.kind);
        return;
      }
    } catch {
      /* no cache */
    }
    let alive = true;
    fetchJson(`https://api.open-meteo.com/v1/forecast?latitude=${p.lat}&longitude=${p.lon}&current=weather_code`)
      .then((data) => {
        const code = data?.current?.weather_code;
        if (!alive || typeof code !== 'number') return;
        const k = weatherKind(code);
        setKind(k);
        try {
          sessionStorage.setItem(CACHE_KEY, JSON.stringify({ tag, kind: k, at: Date.now() }));
        } catch {
          /* no cache */
        }
      })
      .catch(() => {
        /* no weather — the window keeps its plain sky */
      });
    return () => {
      alive = false;
    };
  }, [p]);
  return kind;
}

/** Looks up a town by name (Open-Meteo geocoding). */
export async function findPlace(query: string): Promise<WeatherPlace | null> {
  const q = query.trim();
  if (!q) return null;
  const data = await fetchJson(
    `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(q)}&count=1&language=${getLang()}&format=json`
  );
  const hit = data?.results?.[0];
  if (!hit || typeof hit.latitude !== 'number') return null;
  return { lat: hit.latitude, lon: hit.longitude, name: hit.name };
}

/** Asks the browser for the rough location (it shows its own prompt). */
export function locate(): Promise<WeatherPlace> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) return reject(new Error('no geolocation'));
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ lat: pos.coords.latitude, lon: pos.coords.longitude, name: tr('your area', 'deine Gegend') }),
      reject,
      { enableHighAccuracy: false, timeout: 15000, maximumAge: 60 * 60 * 1000 }
    );
  });
}
