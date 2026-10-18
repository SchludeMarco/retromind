import React, { useEffect, useState } from 'react';
import { isGerman, tr } from '../lib/i18n';
import { viaProxy } from '../lib/privacy';
import { hitOf, yearOf } from '../lib/yearFacts';

// "Today in your youth" (Marco, 2026-10-18): what happened on today's date
// back when you were young, from Wikipedia's "On this day" (through our own
// proxy, so Wikipedia never sees the visitor). Different every day, which
// gives the start page something new each morning. With a birth date it picks
// the years you were 6 to 20; without one, the decade of the journey.

interface DayEvent {
  year: number;
  text: string;
}

const cache = new Map<string, Promise<DayEvent[]>>();

function fetchEvents(now: Date): Promise<DayEvent[]> {
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const dd = String(now.getDate()).padStart(2, '0');
  const lang = isGerman ? 'de' : 'en';
  const url = `https://${lang}.wikipedia.org/api/rest_v1/feed/onthisday/events/${mm}/${dd}`;
  if (!cache.has(url)) {
    cache.set(
      url,
      fetch(viaProxy(url))
        .then((r) => (r.ok ? r.json() : null))
        .then((data) =>
          ((data?.events ?? []) as any[])
            .map((e) => ({ year: Number(e.year), text: String(e.text ?? '').trim(), pages: Array.isArray(e.pages) ? e.pages.length : 0 }))
            .filter((e) => e.year > 0 && e.text)
            // Events with more linked articles are usually the ones people remember.
            .sort((a, b) => b.pages - a.pages)
            .map(({ year, text }) => ({ year, text }))
        )
        .catch(() => [])
    );
  }
  return cache.get(url)!;
}

export const YouthToday: React.FC<{ warm: boolean; birthYear: number | null; focusDecade: string }> = ({ warm, birthYear, focusDecade }) => {
  const [events, setEvents] = useState<DayEvent[] | null>(null);
  const now = new Date();
  const from = birthYear ? birthYear + 6 : Number(focusDecade);
  const to = birthYear ? birthYear + 20 : Number(focusDecade) + 9;

  useEffect(() => {
    let alive = true;
    fetchEvents(new Date()).then((all) => {
      if (!alive) return;
      const mine = all.filter((e) => e.year >= from && e.year <= to);
      // One per year, at most three, oldest first.
      const seen = new Set<number>();
      setEvents(mine.filter((e) => !seen.has(e.year) && seen.add(e.year)).slice(0, 3).sort((a, b) => a.year - b.year));
    });
    return () => {
      alive = false;
    };
  }, [from, to]);

  if (!events || events.length === 0 || !from) return null;
  const lead = events[0];
  const hit = hitOf(lead.year);
  const motto = yearOf(lead.year);
  const date = now.toLocaleDateString(isGerman ? 'de-DE' : 'en-US', { day: 'numeric', month: 'long' });

  return (
    <section
      aria-labelledby="rm-youth-today"
      className={warm ? 'rounded-2xl bg-retro-cream p-5 md:p-6 text-left' : 'retro-card w-full max-w-2xl mx-auto mb-6 p-6 bg-white text-left'}
    >
      <p className="text-xs uppercase tracking-widest font-bold text-retro-amber-dark mb-1">
        📺 {birthYear ? tr('Today in your youth', 'Heute in deiner Jugend') : tr(`Today in the ${focusDecade}s`, `Heute in den ${focusDecade}ern`)}
      </p>
      <h2 id="rm-youth-today" className={`${warm ? 'text-xl' : 'text-2xl'} retro-serif mb-3`}>
        {birthYear
          ? tr(
              `On ${date}, ${now.getFullYear() - lead.year} years ago, you were ${lead.year - birthYear}.`,
              `Am ${date} vor ${now.getFullYear() - lead.year} Jahren warst du ${lead.year - birthYear}.`
            )
          : tr(`What happened on ${date} back then`, `Was am ${date} damals geschah`)}
      </h2>
      <ul className="space-y-2 mb-3">
        {events.map((e) => (
          <li key={e.year} className="flex gap-3">
            <span className="font-bold text-retro-amber-dark shrink-0 w-12">{e.year}</span>
            {/* min-w-0 + wrapping: a long word ("Schachweltmeisterschaft") must not
                push the text past the card's edge on a phone. */}
            <span className="leading-snug min-w-0 [overflow-wrap:anywhere] hyphens-auto">{e.text}</span>
          </li>
        ))}
      </ul>
      {(hit || motto) && (
        <p className="text-sm text-retro-brown">
          {motto && <>{tr(`${lead.year} was ${motto}.`, `${lead.year} war ${motto}.`)} </>}
          {hit && tr(`The No. 1 of that year: “${hit.title}” by ${hit.artist}.`, `Die Nr. 1 des Jahres: „${hit.title}“ von ${hit.artist}.`)}
        </p>
      )}
      <p className="text-[10px] text-retro-tan mt-2">{tr('Source: Wikipedia, “On this day”', 'Quelle: Wikipedia, „Was geschah am …“')}</p>
    </section>
  );
};
