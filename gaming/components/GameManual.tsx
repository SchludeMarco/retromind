import React, { useCallback, useEffect, useRef, useState } from 'react';
import { chip } from '../lib/chiptune';
import { tr } from '../../lib/i18n';
import { PRIZES } from '../lib/quests';

// The instruction manual of the whole app, made to look like the little
// booklet that came in the box of an 80s game (Marco, 2026-11-27: "Nur beim
// ersten Start der App sollte eine allgemeine Erklärung der App und ihrer
// Funktionen kommen. Diese darf gerne etwas hübsch sein und wirken wie eine
// alte 80er Jahre Anleitung. Auch nachdem diese Liste bereits zum ersten Mal
// erschienen ist, sollte man diese trotzdem wieder abrufen können").
// It opens by itself the first time someone is in the hall, and any time
// again via "📖 ANLEITUNG" behind the handle on the right edge. Whether it
// was seen is kept in retromind.gaming.manual (synced like the savegame,
// lib/sync.ts), so it shows once per person, not once per device.

const KEY = 'retromind.gaming.manual';

function seen(): boolean {
  try {
    return localStorage.getItem(KEY) === '1';
  } catch {
    return false;
  }
}

/** Whether the manual is open: by itself the first time in the hall, then on request. */
export function useGameManual(active: boolean) {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    if (active && !seen()) setOpen(true);
  }, [active]);
  const close = useCallback(() => {
    try {
      localStorage.setItem(KEY, '1');
    } catch {
      /* storage unavailable: the manual simply comes again next time */
    }
    setOpen(false);
  }, []);
  const show = useCallback(() => setOpen(true), []);
  /** True while the manual is still due, so nothing else pops up in the same moment. */
  const due = active && !seen();
  return { open: open || due, close, show };
}

interface Page {
  /** Heading of the page, in capitals like the old booklets. */
  title: () => string;
  body: () => React.ReactNode;
}

const Row: React.FC<{ icon: string; children: React.ReactNode }> = ({ icon, children }) => (
  <li>
    <span className="manual-icon" aria-hidden="true">
      {icon}
    </span>
    <span>{children}</span>
  </li>
);

const PAGES: Page[] = [
  {
    title: () => tr('CONTENTS', 'INHALT'),
    body: () => (
      <>
        <div className="manual-warning">
          <strong>{tr('⚠ PLEASE READ', '⚠ BITTE LESEN')}</strong>
          <p>
            {tr(
              'Thank you for choosing RetroMind Gaming! Please read this instruction booklet to get the most out of your visit to the arcade. Keep it in a safe place: you can open it again any time.',
              'Vielen Dank, dass du dich für RetroMind Gaming entschieden hast! Bitte lies dieses Anleitungsheft, damit du das Beste aus deinem Besuch in der Spielhalle herausholst. Bewahre es gut auf: Du kannst es jederzeit wieder aufschlagen.'
            )}
          </p>
        </div>
        <ol className="manual-toc">
          <li><span>{tr('The arcade at a glance', 'Die Spielhalle im Überblick')}</span><span>2</span></li>
          <li><span>{tr('Controls', 'Die Steuerung')}</span><span>3</span></li>
          <li><span>{tr('Play yourself', 'Selbst zocken')}</span><span>4</span></li>
          <li><span>{tr('Coins & the prize counter', 'Coins & der Preis-Tresen')}</span><span>5</span></li>
          <li><span>{tr('Collect & discover', 'Sammeln & Entdecken')}</span><span>6</span></li>
          <li><span>{tr('Settings & customer service', 'Einstellungen & Kundendienst')}</span><span>7</span></li>
        </ol>
      </>
    ),
  },
  {
    title: () => tr('THE ARCADE AT A GLANCE', 'DIE SPIELHALLE IM ÜBERBLICK'),
    body: () => (
      <>
        <p>
          {tr(
            'RetroMind Gaming is a walk through video game history, from Pong to today. You discover games, play them yourself, earn coins and compete with the other guests.',
            'RetroMind Gaming ist ein Streifzug durch die Videospielgeschichte, von Pong bis heute. Du entdeckst Spiele, zockst selbst, verdienst Coins und misst dich mit den anderen Gästen.'
          )}
        </p>
        <ul className="manual-list">
          <Row icon="📼">{tr('CATALOG: hundreds of games, sorted by decade and console.', 'KATALOG: Hunderte Spiele, sortiert nach Jahrzehnt und Konsole.')}</Row>
          <Row icon="🕹️">{tr('PLAY: daily challenge, lightning challenges, retro console and quick games.', 'ZOCKEN: Tages-Challenge, Blitz-Challenges, Retro-Konsole und Schnellspiele.')}</Row>
          <Row icon="🪙">{tr('QUESTS: small daily tasks for coins, and the prize counter.', 'QUESTS: kleine Tagesaufgaben für Coins, dazu der Preis-Tresen.')}</Row>
          <Row icon="⭐">{tr('STASH, TROPHIES and LEGENDS: your shelf, your achievements and schoolyard myths.', 'STASH, TROPHÄEN und LEGENDEN: dein Regal, deine Erfolge und Schulhof-Mythen.')}</Row>
          <Row icon="🏆">{tr('HALL OF FAME: the high score tables of all guests.', 'BESTENLISTE: die Highscore-Tafeln aller Gäste.')}</Row>
        </ul>
      </>
    ),
  },
  {
    title: () => tr('CONTROLS', 'DIE STEUERUNG'),
    body: () => (
      <>
        <div className="manual-diagram" aria-hidden="true">
          <span className="manual-pad">✚</span>
          <span className="manual-buttons">
            <i>B</i>
            <i>A</i>
          </span>
        </div>
        <ul className="manual-list">
          <Row icon="🔍">{tr('SEARCH BAR at the top: finds any game that has a Wikipedia article.', 'SUCHLEISTE oben: findet jedes Spiel, das einen Wikipedia-Artikel hat.')}</Row>
          <Row icon="🪙">{tr('INSERT COIN: picks a random game for you.', 'INSERT COIN: sucht dir ein Zufallsspiel aus.')}</Row>
          <Row icon="🎮">{tr('CONTROLLER top right: straight to the games you play yourself.', 'CONTROLLER oben rechts: direkt zu den Spielen zum Selberzocken.')}</Row>
          <Row icon="◀">{tr('HANDLE on the right edge: all areas, music, settings, chat, feedback and the way out.', 'GRIFF am rechten Rand: alle Bereiche, Musik, Einstellungen, Chat, Feedback und der Ausgang.')}</Row>
          <Row icon="ℹ️">{tr('“HOW IT WORKS” next to the name of an area explains that area.', '„SO GEHT’S“ neben dem Namen eines Bereichs erklärt genau diesen Bereich.')}</Row>
          <Row icon="⌨">{tr('With a keyboard or gamepad, arrow keys and Enter move through the hall.', 'Mit Tastatur oder Gamepad bewegst du dich mit Pfeiltasten und Enter durch die Halle.')}</Row>
        </ul>
      </>
    ),
  },
  {
    title: () => tr('PLAY YOURSELF', 'SELBST ZOCKEN'),
    body: () => (
      <ul className="manual-list">
        <Row icon="❗">{tr('DAILY CHALLENGE: the same game for everyone, every day. Win it for 25 coins. The bell next to it sets a reminder.', 'TAGES-CHALLENGE: jeden Tag dasselbe Spiel für alle. Schaffst du sie, gibt es 25 Coins. Die Glocke daneben stellt eine Erinnerung ein.')}</Row>
        <Row icon="☠">{tr('BOSS OF THE DAY: three rounds, three hearts, up to 105 coins. On Sundays the Overlord: four rounds, double coins.', 'ENDGEGNER DES TAGES: drei Runden, drei Herzen, bis zu 105 Coins. Sonntags der Overlord: vier Runden, doppelte Coins.')}</Row>
        <Row icon="⚡">{tr('LIGHTNING CHALLENGES: six games of exactly 30 seconds.', 'BLITZ-CHALLENGES: sechs Spiele mit genau 30 Sekunden.')}</Row>
        <Row icon="📺">{tr('RETRO CONSOLE: real NES and Game Boy games right in the browser.', 'RETRO-KONSOLE: echte NES- und Game-Boy-Spiele direkt im Browser.')}</Row>
        <Row icon="💾">{tr('PLAY YOUR OWN ROM: load a game file of your own.', 'EIGENE ROM SPIELEN: lade eine eigene Spieldatei.')}</Row>
        <Row icon="🃏">{tr('QUICK GAMES: Snake, block stacking, pinball, poker, blackjack, solitaire and more.', 'SCHNELLSPIELE: Snake, Blockstapler, Flipper, Poker, Blackjack, Solitär und mehr.')}</Row>
        <Row icon="🏆">{tr('Good runs land on the high score tables. Watch out who passes you!', 'Gute Runden landen auf den Highscore-Tafeln. Pass auf, wer dich überholt!')}</Row>
      </ul>
    ),
  },
  {
    title: () => tr('COINS & THE PRIZE COUNTER', 'COINS & DER PREIS-TRESEN'),
    body: () => (
      <>
        <p className="manual-sub">{tr('HOW TO EARN COINS', 'SO VERDIENST DU COINS')}</p>
        <ul className="manual-list">
          <Row icon="📜">{tr('Three new quests every day, plus a bigger one each week.', 'Jeden Tag drei neue Quests, dazu jede Woche eine größere.')}</Row>
          <Row icon="❗">{tr('The daily challenge: +25.', 'Die Tages-Challenge: +25.')}</Row>
          <Row icon="☠">{tr('The boss of the day: up to +105, on Sundays up to +210.', 'Der Endgegner des Tages: bis zu +105, sonntags bis zu +210.')}</Row>
          <Row icon="🔥">{tr('Your streak: days in a row bring more each day.', 'Deine Serie: Tage in Folge bringen jeden Tag mehr.')}</Row>
          <Row icon="🥚">{tr('Easter eggs hidden all over the hall, and the quiz.', 'Easter Eggs, überall in der Halle versteckt, und das Quiz.')}</Row>
        </ul>
        <p className="manual-sub">{tr('HOW TO SPEND THEM', 'SO GIBST DU SIE AUS')}</p>
        <p>
          {tr(
            `Tap 🪙 COINS at the top: the prize counter waits under the quests. ${PRIZES.length} prizes, bought once and yours for good: new designs for the whole hall, new hall music and effects like the tube TV look, the pixel pointer or the golden VIP crown.`,
            `Tipp oben auf 🪙 COINS: Unter den Quests wartet der Preis-Tresen. ${PRIZES.length} Preise, einmal gekauft und für immer deins: neue Designs für die ganze Halle, neue Hallenmusik und Effekte wie das Röhrenbild, der Pixel-Zeiger oder die goldene VIP-Krone.`
          )}
        </p>
      </>
    ),
  },
  {
    title: () => tr('COLLECT & DISCOVER', 'SAMMELN & ENTDECKEN'),
    body: () => (
      <ul className="manual-list">
        <Row icon="📖">{tr('GAME PAGE: tap a cartridge for story, facts, videos, music, screenshots and a guide.', 'SPIELESEITE: Tipp ein Modul an, dann gibt es Geschichte, Fakten, Videos, Musik, Screenshots und einen Guide.')}</Row>
        <Row icon="☆">{tr('STASH: “Collect” and “I had it back then” fill your own shelf.', 'STASH: „Sammeln“ und „Hatte ich damals“ füllen dein eigenes Regal.')}</Row>
        <Row icon="🏅">{tr('TROPHIES unlock by themselves as you play and discover.', 'TROPHÄEN schalten sich beim Spielen und Entdecken von selbst frei.')}</Row>
        <Row icon="👻">{tr('LEGENDS: schoolyard rumors from gaming history. True or myth?', 'LEGENDEN: Schulhof-Gerüchte aus der Spielegeschichte. Wahr oder Mythos?')}</Row>
        <Row icon="📅">{tr('TODAY X YEARS AGO: the game that came out on this day.', 'HEUTE VOR X JAHREN: das Spiel, das an diesem Tag herauskam.')}</Row>
        <Row icon="📈">{tr('Everything you find raises your SCORE at the top.', 'Alles, was du findest, erhöht deinen SCORE oben.')}</Row>
      </ul>
    ),
  },
  {
    title: () => tr('SETTINGS & CUSTOMER SERVICE', 'EINSTELLUNGEN & KUNDENDIENST'),
    body: () => (
      <>
        <ul className="manual-list">
          <Row icon="⚙">{tr('SETTINGS behind the handle: language, designs, hall music, sound and Spotify.', 'EINSTELLUNGEN hinter dem Griff: Sprache, Designs, Hallenmusik, Ton und Spotify.')}</Row>
          <Row icon="🔑">{tr('Sign in with Google at the door: coins, streak and score stay safe on all devices.', 'Melde dich an der Tür mit Google an: Coins, Serie und Punkte bleiben auf allen Geräten erhalten.')}</Row>
          <Row icon="☻">{tr('The GURU knows everything about games; the help at the bottom right answers questions about the app.', 'Der GURU weiß alles über Spiele; die Hilfe unten rechts beantwortet Fragen zur App.')}</Row>
          <Row icon="✉">{tr('FEEDBACK: tell us what to make better.', 'FEEDBACK: Sag uns, was wir besser machen sollen.')}</Row>
        </ul>
        <div className="manual-stamp">
          {tr('You can open this booklet again any time: handle on the right edge → 📖 MANUAL.', 'Dieses Heft schlägst du jederzeit wieder auf: Griff am rechten Rand → 📖 ANLEITUNG.')}
        </div>
      </>
    ),
  },
];

/** The booklet. Page 0 is the cover, then the pages above. */
export const GameManual: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [page, setPage] = useState(0);
  const last = PAGES.length; // cover + PAGES
  const closeRef = useRef<HTMLButtonElement>(null);
  const go = useCallback(
    (to: number) => {
      if (to < 0 || to > last) return;
      chip.play('blip');
      setPage(to);
    },
    [last]
  );
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      else if (e.key === 'ArrowRight') go(page + 1);
      else if (e.key === 'ArrowLeft') go(page - 1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [go, page, onClose]);
  useEffect(() => {
    closeRef.current?.focus();
  }, []);

  const p = page > 0 ? PAGES[page - 1] : null;
  return (
    <div className="overlay manual-overlay" onClick={onClose}>
      <div
        className="manual"
        role="dialog"
        aria-modal="true"
        aria-label={tr('Instruction manual', 'Spielanleitung')}
        onClick={(e) => e.stopPropagation()}
      >
        <button ref={closeRef} className="manual-close" onClick={onClose} aria-label={tr('Close the manual', 'Anleitung schließen')} data-nav>
          ✕
        </button>
        {p ? (
          <div key={page} className="manual-page">
            <h2 className="manual-title">{p.title()}</h2>
            <div className="manual-body">{p.body()}</div>
            <span className="manual-folio">– {page + 1} –</span>
          </div>
        ) : (
          <div className="manual-page manual-cover">
            <div className="manual-band">
              <span>{tr('INSTRUCTION BOOKLET', 'SPIELANLEITUNG')}</span>
              <span>RMG-1987</span>
            </div>
            <div className="manual-logo">
              <span className="manual-logo-top">RETRO</span>
              <span className="manual-logo-main">MIND</span>
              <span className="manual-logo-sub">GAMING</span>
            </div>
            <div className="manual-sun" aria-hidden="true" />
            <p className="manual-cover-line">{tr('THE ARCADE OF VIDEO GAME HISTORY', 'DIE SPIELHALLE DER VIDEOSPIELGESCHICHTE')}</p>
            <p className="manual-cover-small">{tr('1 PLAYER · AND ALL GUESTS OF THE HALL', '1 SPIELER · UND ALLE GÄSTE DER HALLE')}</p>
            <div className="manual-band manual-band-low">
              <span>{tr('FOR HOME AND ON THE GO', 'FÜR ZUHAUSE UND UNTERWEGS')}</span>
              <span>★ ★ ★</span>
            </div>
          </div>
        )}
        <nav className="manual-nav">
          <button className="manual-btn" onClick={() => go(page - 1)} disabled={page === 0} data-nav>
            ◄ {tr('BACK', 'ZURÜCK')}
          </button>
          <span className="manual-dots" aria-label={tr(`Page ${page + 1} of ${last + 1}`, `Seite ${page + 1} von ${last + 1}`)}>
            {Array.from({ length: last + 1 }, (_, i) => (
              <button
                key={i}
                className={i === page ? 'on' : ''}
                onClick={() => go(i)}
                aria-label={tr(`Page ${i + 1}`, `Seite ${i + 1}`)}
                tabIndex={-1}
              />
            ))}
          </span>
          {page < last ? (
            <button className="manual-btn manual-next" onClick={() => go(page + 1)} data-nav>
              {page === 0 ? tr('OPEN ►', 'AUFSCHLAGEN ►') : tr('NEXT ►', 'WEITER ►')}
            </button>
          ) : (
            <button
              className="manual-btn manual-next"
              onClick={() => {
                chip.play('start');
                onClose();
              }}
              data-nav
            >
              {tr('LET’S PLAY! ►', 'LOS GEHT’S! ►')}
            </button>
          )}
        </nav>
      </div>
    </div>
  );
};
