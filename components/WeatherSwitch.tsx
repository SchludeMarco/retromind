import React, { useState } from 'react';
import { tr } from '../lib/i18n';
import { PRIVACY_URL } from '../lib/privacy';
import { findPlace, locate, setWeatherPlace, useWeatherPlace } from '../lib/weather';

// The small line under the living room that switches the real weather in its
// window on and off (lib/weather.ts). Nothing is asked or sent until the
// person picks one of the two ways to give a place.
export const WeatherSwitch: React.FC = () => {
  const place = useWeatherPlace();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const done = () => {
    setOpen(false);
    setQuery('');
    setError('');
  };

  const useLocation = async () => {
    setBusy(true);
    setError('');
    try {
      setWeatherPlace(await locate());
      done();
    } catch {
      setError(tr(
        'Your location isn’t available. Just type in your town instead.',
        'Dein Standort ist nicht verfügbar. Gib stattdessen einfach deinen Ort ein.'
      ));
    } finally {
      setBusy(false);
    }
  };

  const search = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    setBusy(true);
    setError('');
    try {
      const hit = await findPlace(query);
      if (hit) {
        setWeatherPlace(hit);
        done();
      } else {
        setError(tr('We couldn’t find that town. Try a bigger one nearby?', 'Diesen Ort finden wir nicht. Vielleicht eine größere Stadt in der Nähe?'));
      }
    } catch {
      setError(tr('The weather service isn’t answering right now. Try again later.', 'Der Wetterdienst antwortet gerade nicht. Versuch es später noch einmal.'));
    } finally {
      setBusy(false);
    }
  };

  if (place && !open) {
    return (
      <div className="text-sm text-retro-brown -mt-2 mb-4 flex flex-wrap items-center justify-center gap-x-3">
        <span>{tr(`The window shows the weather in ${place.name}.`, `Im Fenster ist das Wetter in ${place.name}.`)}</span>
        <span className="flex items-center gap-1">
          <button type="button" onClick={() => setOpen(true)} className="underline font-semibold min-h-11 px-1">
            {tr('Change', 'Ändern')}
          </button>
          <span aria-hidden="true">·</span>
          <button type="button" onClick={() => setWeatherPlace(null)} className="underline font-semibold min-h-11 px-1">
            {tr('Turn off', 'Ausschalten')}
          </button>
        </span>
      </div>
    );
  }

  if (!open) {
    return (
      <p className="text-center -mt-2 mb-4">
        <button type="button" onClick={() => setOpen(true)} className="text-sm underline font-semibold text-retro-brown min-h-11 px-2">
          {tr('🌦️ Show your real weather in the window', '🌦️ Dein echtes Wetter im Fenster zeigen')}
        </button>
      </p>
    );
  }

  return (
    <div className="rounded-xl bg-retro-cream p-4 mb-5 text-left">
      <p className="font-semibold mb-1">{tr('Rain, snow or sunshine, like outside your door', 'Regen, Schnee oder Sonne, wie vor deiner Tür')}</p>
      <p className="text-sm text-retro-brown mb-3">
        {tr(
          'For this, our server asks the free weather service Open-Meteo. Your place is rounded to about 10 km and stays on this device.',
          'Dafür fragt unser Server beim freien Wetterdienst Open-Meteo nach. Dein Ort wird auf etwa 10 km gerundet und bleibt auf diesem Gerät.'
        )}{' '}
        <a href={PRIVACY_URL} className="underline">{tr('Privacy', 'Datenschutz')}</a>
      </p>
      <button type="button" onClick={useLocation} disabled={busy} className="retro-button bg-retro-amber text-white w-full py-3 font-bold mb-3 disabled:opacity-60">
        {tr('📍 Use my location', '📍 Meinen Standort nehmen')}
      </button>
      <form onSubmit={search} className="flex gap-2">
        <label htmlFor="rm-weather-town" className="sr-only">{tr('Your town', 'Dein Ort')}</label>
        <input
          id="rm-weather-town"
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={tr('or type your town', 'oder Ort eingeben')}
          className="flex-grow min-w-0 border-2 border-retro-ink p-3 bg-white"
        />
        <button type="submit" disabled={busy || !query.trim()} className="retro-button px-4 border-2 border-retro-ink bg-white font-semibold disabled:opacity-60">
          {tr('Search', 'Suchen')}
        </button>
      </form>
      {error && <p role="alert" className="text-sm text-red-700 mt-2">{error}</p>}
      <p className="text-center mt-2">
        <button type="button" onClick={done} className="text-sm underline text-retro-brown min-h-11 px-2">
          {tr('Not now', 'Lieber nicht')}
        </button>
      </p>
    </div>
  );
};
