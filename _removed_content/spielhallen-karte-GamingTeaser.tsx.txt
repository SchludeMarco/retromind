import React from 'react';
import { tr } from '../lib/i18n';
import { gamingHref } from '../lib/gamingLink';
import { GamingSignpost } from './GamingSignpost';
import './gamingTeaser.css';

// The gaming card right under "Start the time travel" (Marco, 2026-10-16:
// "der große Gaming-Bereich ist leicht zu übersehen, man denkt nicht, dass
// das so ein großer Teil der App ist"). The signpost used to stand at the
// very bottom of the start page, three to four screens down on a phone; now
// it sits in this card next to the photo of the arcade entrance and a few
// lines on what waits inside. Same neon look in every design, like the
// gaming edition itself.

const PERKS = [
  tr('🕹️ Games from 1970 to today', '🕹️ Spiele von 1970 bis heute'),
  tr('👾 10+ mini games', '👾 Über 10 Minispiele'),
  tr('🏆 Highscores & quests', '🏆 Highscores & Quests'),
  tr('🎸 Metal in the hall', '🎸 Metal in der Halle'),
];

export const GamingTeaser: React.FC<{ className?: string }> = ({ className = '' }) => (
  <section className={`gaming-teaser ${className}`} aria-labelledby="gaming-teaser-title">
    <a
      className="gaming-teaser-photo"
      href={gamingHref()}
      onClick={(e) => {
        e.currentTarget.href = gamingHref();
      }}
      tabIndex={-1}
      aria-hidden="true"
    >
      <img src="/gaming/arcade-entrance.webp" alt="" loading="lazy" decoding="async" />
    </a>
    <div className="gaming-teaser-body">
      <p className="gaming-teaser-kicker">{tr('Next door · RetroMind – Gaming', 'Nebenan · RetroMind – Gaming')}</p>
      <h2 id="gaming-teaser-title" className="gaming-teaser-title">
        {tr('The arcade next door', 'Die Spielhalle nebenan')}
      </h2>
      <p className="gaming-teaser-text">
        {tr(
          'A whole second app: forgotten video games with covers, reviews from back then, tips and videos, plus mini games, a quiz and coins to win.',
          'Eine ganze zweite App: vergessene Videospiele mit Covern, Tests von damals, Tipps und Videos, dazu Minispiele, ein Quiz und Coins zum Gewinnen.'
        )}
      </p>
      <ul className="gaming-teaser-perks">
        {PERKS.map((p) => (
          <li key={p}>{p}</li>
        ))}
      </ul>
      <GamingSignpost />
    </div>
  </section>
);
