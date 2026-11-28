import React, { useCallback, useEffect, useRef, useState } from 'react';
import { chip } from '../lib/chiptune';
import { tr } from '../../lib/i18n';
import { PRIZES } from '../lib/quests';

// A short guide for every area of the hall (Marco, 2026-11-27: "Wenn man in
// den Gaming-Bereich geht, sollte man eine gute Erklärung für diesen Bereich
// bekommen, die aber nicht immer kommt. Nur beim ersten Mal. Trotzdem sollte
// man die Erklärung jederzeit aufrufen können. Genauso soll das mit jedem
// Bereich gemacht werden"). The first visit to an area opens its guide; the
// ℹ️ button next to the area's name brings it back any time. Which guides
// were seen is kept in retromind.gaming.guides (synced like the savegame,
// lib/sync.ts), so a guide shows once per person, not once per device.

export type GuideArea = 'catalog' | 'collection' | 'search' | 'trophies' | 'chill' | 'quests' | 'legends' | 'hof';

const KEY = 'retromind.gaming.guides';

function readSeen(): GuideArea[] {
  try {
    const list = JSON.parse(localStorage.getItem(KEY) || '[]');
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  }
}

export function markGuideSeen(area: GuideArea) {
  try {
    const seen = readSeen();
    if (!seen.includes(area)) localStorage.setItem(KEY, JSON.stringify([...seen, area]));
  } catch {
    /* storage unavailable: the guide simply comes again next time */
  }
}

/** Whether the guide of `area` is open: on by itself the first time, then by the ℹ️ button. */
export function useAreaGuide(area: GuideArea, active = true) {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    if (active) setOpen(!readSeen().includes(area));
  }, [area, active]);
  const close = useCallback(() => {
    markGuideSeen(area);
    setOpen(false);
  }, [area]);
  const toggle = useCallback(() => {
    chip.play('blip');
    if (open) close();
    else setOpen(true);
  }, [open, close]);
  return { open, close, toggle };
}

interface Guide {
  title: () => string;
  intro: () => string;
  points: () => string[];
}

const GUIDES: Record<GuideArea, Guide> = {
  catalog: {
    title: () => tr('WELCOME TO THE ARCADE', 'WILLKOMMEN IN DER SPIELHALLE'),
    intro: () =>
      tr(
        'RetroMind Gaming is a walk through video game history, from Pong to today. This is the catalog, the heart of the hall.',
        'RetroMind Gaming ist ein Streifzug durch die Videospielgeschichte, von Pong bis heute. Das hier ist der Katalog, das Herz der Halle.'
      ),
    points: () => [
      tr('Swipe through the decades and consoles at the top, or search for any game with the search bar.', 'Oben wischst du durch Jahrzehnte und Konsolen, oder du suchst mit der Suchleiste nach jedem beliebigen Spiel.'),
      tr('Tap a cartridge to open its game page: story, facts, videos, music, screenshots and a guide.', 'Tipp ein Modul an, dann öffnet sich die Spieleseite: Geschichte, Fakten, Videos, Musik, Screenshots und ein Guide.'),
      tr('INSERT COIN picks a random game for you. Every game you open counts as found and brings points.', 'INSERT COIN sucht dir ein Zufallsspiel aus. Jedes Spiel, das du öffnest, zählt als entdeckt und bringt Punkte.'),
      tr('The controller top right takes you to the games you play yourself; the handle on the right edge opens all other areas, the settings and the way out.', 'Der Controller oben rechts bringt dich zu den Spielen zum Selberzocken; der Griff am rechten Rand öffnet alle anderen Bereiche, die Einstellungen und den Ausgang.'),
      tr(
        'Coins come from quests, the daily challenge, your streak, Easter eggs and the quiz. You spend them at the prize counter: tap 🪙 COINS at the top.',
        'Coins gibt es für Quests, die Tages-Challenge, deine Serie, Easter Eggs und das Quiz. Ausgeben kannst du sie am Preis-Tresen: oben auf 🪙 COINS tippen.'
      ),
      tr('Sign in with Google at the door to keep coins, streak and score safe on all devices.', 'Melde dich an der Tür mit Google an, dann bleiben Coins, Serie und Punkte auf allen Geräten erhalten.'),
    ],
  },
  collection: {
    title: () => tr('YOUR STASH', 'DEIN STASH'),
    intro: () => tr('Your own shelf: the games you like and the ones you had back then.', 'Dein eigenes Regal: die Spiele, die dir gefallen, und die, die du damals hattest.'),
    points: () => [
      tr('On a game page, “☆ Collect” puts the game in your stash.', 'Auf einer Spieleseite legt „☆ Sammeln“ das Spiel in deinen Stash.'),
      tr('“I had it back then” puts games and consoles on the shelf of your childhood.', '„Hatte ich damals“ stellt Spiele und Konsolen ins Regal deiner Kindheit.'),
      tr('Everything is sorted by year, and every game in the stash brings points.', 'Alles steht nach Jahr sortiert, und jedes Spiel im Stash bringt Punkte.'),
    ],
  },
  search: {
    title: () => tr('THE SEARCH', 'DIE SUCHE'),
    intro: () => tr('Finds every game that has a Wikipedia article, not just the ones in the catalog.', 'Findet jedes Spiel, das einen Wikipedia-Artikel hat, nicht nur die aus dem Katalog.'),
    points: () => [
      tr('Type a title, a series or a word like “racing” and press GO!', 'Gib einen Titel, eine Serie oder ein Wort wie „Rennspiel“ ein und drück GO!'),
      tr('Games with your word in the title come first; “Show related games” brings more.', 'Spiele mit deinem Begriff im Titel kommen zuerst; „Ähnliche Games zeigen“ holt noch mehr.'),
      tr('Some secret words in the search hide Easter eggs …', 'Manche geheimen Wörter in der Suche verstecken Easter Eggs …'),
    ],
  },
  trophies: {
    title: () => tr('TROPHIES', 'TROPHÄEN'),
    intro: () => tr('Your achievements in the hall, like on a real console.', 'Deine Erfolge in der Halle, wie auf einer echten Konsole.'),
    points: () => [
      tr('Trophies unlock by themselves: find games, fill your stash, play, solve quests.', 'Trophäen schalten sich von selbst frei: Spiele entdecken, den Stash füllen, zocken, Quests lösen.'),
      tr('Locked ones show what you still have to do.', 'Gesperrte zeigen, was du dafür noch tun musst.'),
      tr('Each trophy raises your score at the top.', 'Jede Trophäe erhöht deinen Punktestand oben.'),
    ],
  },
  chill: {
    title: () => tr('PLAY YOURSELF', 'SELBST ZOCKEN'),
    intro: () => tr('Here you play yourself: real old consoles in the browser and quick games for in between.', 'Hier zockst du selbst: echte alte Konsolen im Browser und Schnellspiele für zwischendurch.'),
    points: () => [
      tr('The daily challenge is the same for everyone and brings 25 coins. The red “!” flashes while it is open; the bell sets a reminder.', 'Die Tages-Challenge ist für alle gleich und bringt 25 Coins. Das rote „!“ blinkt, solange sie offen ist; die Glocke stellt eine Erinnerung ein.'),
      tr('The boss of the day waits right below: beat him in three 30-second rounds with three hearts. Up to 105 coins, on Sundays the Overlord pays double.', 'Darunter wartet der Endgegner des Tages: Besieg ihn in drei 30-Sekunden-Runden mit drei Herzen. Bis zu 105 Coins, sonntags zahlt der Overlord doppelt.'),
      tr('Lightning Challenges: six games of exactly 30 seconds each.', 'Blitz-Challenges: sechs Spiele mit genau 30 Sekunden.'),
      tr('The retro console runs real NES and Game Boy games; with “Play your own ROM” you can load your own game file.', 'Die Retro-Konsole spielt echte NES- und Game-Boy-Spiele; mit „Eigene ROM spielen“ lädst du deine eigene Spieldatei.'),
      tr('Quick games: classics like Snake, Tetris-style blocks, pinball and cards. Good runs go on the high score tables.', 'Schnellspiele: Klassiker wie Snake, Blockstapler, Flipper und Karten. Gute Runden kommen auf die Highscore-Tafeln.'),
      tr('🎲 picks a random game, 🏆 opens the Hall of Fame.', '🎲 sucht ein Zufallsspiel aus, 🏆 öffnet die Bestenliste.'),
    ],
  },
  quests: {
    title: () => tr('QUESTS & PRIZE COUNTER', 'QUESTS & PREIS-TRESEN'),
    intro: () => tr('Here you earn coins with small tasks, and here you spend them at the prize counter.', 'Hier verdienst du Coins mit kleinen Aufgaben, und hier gibst du sie am Preis-Tresen aus.'),
    points: () => [
      tr(
        `Spend: at the prize counter (further down on this page) each prize costs coins once and is yours for good: ${PRIZES.map((p) => `${p.label} (${p.price})`).join(', ')}.`,
        `Ausgeben: Am Preis-Tresen (weiter unten auf dieser Seite) kostet jeder Preis einmal Coins und gehört dann dir: ${PRIZES.map((p) => `${p.label} (${p.price})`).join(', ')}.`
      ),
      tr(
        'Designs change the colors of the whole hall, music changes the hall’s own chiptune music (when Spotify isn’t playing), effects add something extra: rainbow logo, tube TV look, pixel pointer or the golden VIP crown. After buying, “Use” or “On/Off” switches it; designs and music can be changed back any time in the settings.',
        'Designs ändern die Farben der ganzen Halle, Musik die eigene Chiptune-Hallenmusik (wenn kein Spotify läuft), Effekte bringen ein Extra: Regenbogen-Logo, Röhrenbild, Pixel-Zeiger oder die goldene VIP-Krone. Nach dem Kauf schaltet „Benutzen“ bzw. „An/Aus“ es um; Designs und Musik wechselst du jederzeit in den Einstellungen zurück.'
      ),
      tr(
        'Earn: quests, the daily challenge (+25), the boss of the day (up to +105, Sundays double), your streak, Easter eggs and the quiz “Do you know the game?”. Out of hearts against the boss, a continue costs 10 coins.',
        'Verdienen: Quests, die Tages-Challenge (+25), der Endgegner des Tages (bis zu +105, sonntags doppelt), deine Serie, Easter Eggs und das Quiz „Erkennst du das Spiel?“. Keine Herzen mehr gegen den Boss? Ein Continue kostet 10 Coins.'
      ),
      tr('Three new quests every day, plus a bigger one each week. Each brings coins.', 'Jeden Tag drei neue Quests, dazu jede Woche eine größere. Jede bringt Coins.'),
      tr('Days in a row in the hall build your streak and bring more coins each day.', 'Tage in Folge in der Halle bauen deine Serie auf und bringen jeden Tag mehr Coins.'),
      tr('Every week one quick game is the weekly duel, with its own high score table.', 'Jede Woche ist ein Schnellspiel das Wochen-Duell, mit eigener Highscore-Tafel.'),
      tr('At the prize counter you trade coins for designs, hall music and more.', 'Am Preis-Tresen tauschst du Coins gegen Designs, Hallenmusik und mehr.'),
      tr('The list of Easter eggs with hints is here, too.', 'Auch die Liste der Easter Eggs mit Tipps steht hier.'),
    ],
  },
  legends: {
    title: () => tr('LEGENDS & MYTHS', 'LEGENDEN & MYTHEN'),
    intro: () => tr('Schoolyard rumors from gaming history: true or myth?', 'Schulhof-Gerüchte aus der Spielegeschichte: wahr oder Mythos?'),
    points: () => [
      tr('Read the claim and guess: true, half true or myth.', 'Lies die Behauptung und rate: wahr, halb wahr oder Mythos.'),
      tr('After your guess the story behind it opens.', 'Nach deinem Tipp öffnet sich die Geschichte dahinter.'),
      tr('From the story you get straight to the game it is about.', 'Von der Geschichte aus kommst du direkt zum Spiel, um das es geht.'),
    ],
  },
  hof: {
    title: () => tr('THE HALL OF FAME', 'DIE BESTENLISTE'),
    intro: () => tr('The high score tables of all guests, one per game.', 'Die Highscore-Tafeln aller Gäste, eine pro Spiel.'),
    points: () => [
      tr('The list shows every game with its record and the record holder’s initials; a tap opens its table.', 'Die Liste zeigt jedes Spiel mit Rekord und den Initialen des Rekordhalters; ein Tipp öffnet seine Tafel.'),
      tr('The heart likes a game, and you see how many guests like it.', 'Mit dem Herz likest du ein Spiel und siehst, wie vielen Gästen es gefällt.'),
      tr('“Who passed you” shows who beat your score; with “Play” you take revenge right away.', '„Wer dich überholt hat“ zeigt, wer dich geschlagen hat; mit „Spielen“ holst du dir den Platz gleich zurück.'),
    ],
  },
};

/** The ℹ️ button that opens an area's guide again. */
export const GuideButton: React.FC<{ open: boolean; onToggle: () => void; className?: string; withText?: boolean }> = ({ open, onToggle, className, withText }) => (
  <button
    className={`px-btn guide-btn${className ? ` ${className}` : ''}`}
    onClick={onToggle}
    aria-expanded={open}
    aria-label={open ? tr('Hide the explanation of this area', 'Erklärung zu diesem Bereich ausblenden') : tr('Explain this area', 'Diesen Bereich erklären')}
    title={tr('Explain this area', 'Diesen Bereich erklären')}
    data-nav
  >
    ℹ️{withText && <span className="pixel-font guide-btn-text"> {tr('HOW IT WORKS', 'SO GEHT’S')}</span>}
  </button>
);

/** The guide panel of an area. */
export const AreaGuide: React.FC<{ area: GuideArea; onClose: () => void }> = ({ area, onClose }) => {
  const g = GUIDES[area];
  const ref = useRef<HTMLElement>(null);
  useEffect(() => {
    ref.current?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }, [area]);
  return (
    <section ref={ref} className="area-guide" aria-label={g.title()}>
      <p className="pixel-font area-guide-title">ℹ️ {g.title()}</p>
      <p>{g.intro()}</p>
      <ul>
        {g.points().map((p) => (
          <li key={p}>{p}</li>
        ))}
      </ul>
      <div className="area-guide-foot">
        <button
          className="px-btn"
          onClick={() => {
            chip.play('select');
            onClose();
          }}
          data-nav
        >
          {tr('GOT IT!', 'ALLES KLAR!')}
        </button>
        <span className="dim">{tr('You can bring this back any time with ℹ️.', 'Mit ℹ️ holst du diese Erklärung jederzeit zurück.')}</span>
      </div>
    </section>
  );
};
