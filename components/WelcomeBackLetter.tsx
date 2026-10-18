import React, { useEffect, useState } from 'react';
import { tr } from '../lib/i18n';
import { daysAway, previousVisitDay } from '../lib/visits';
import { newsSince } from '../lib/whatsNew';
import { newAnswersSince } from '../lib/familyBook';

// "Since your last visit": whoever comes back after two days or more finds a
// letter on the table in the Stube, saying what's new since then (What's New
// entries, new family-book answers, today's question). Shown once per visit;
// lib/visits.ts stamps the visit at start, so a reload the same day hides it.
export const WelcomeBackLetter: React.FC<{ warm: boolean; userName: string; dailyAnswered: boolean }> = ({ warm, userName, dailyAnswered }) => {
  const [away] = useState(() => daysAway('zeitreise'));
  const [since] = useState(() => previousVisitDay('zeitreise'));
  const [open, setOpen] = useState(true);
  const [family, setFamily] = useState(0);

  useEffect(() => {
    if (since && away !== null && away >= 2) newAnswersSince(since).then(setFamily);
  }, [since, away]);

  if (!open || away === null || away < 2 || !since) return null;
  const news = newsSince(since, 3);
  const name = userName.trim();
  const items: string[] = [];
  if (!dailyAnswered) items.push(tr('a new question of the day is waiting for you, right below', 'unten wartet eine neue Frage des Tages auf dich'));
  if (family > 0)
    items.push(
      tr(
        `${family} new ${family === 1 ? 'answer' : 'answers'} in the family book`,
        `${family} neue ${family === 1 ? 'Antwort' : 'Antworten'} im Familienbuch`
      )
    );
  for (const n of news) items.push(tr(`new in RetroMind: ${n}`, `neu in RetroMind: ${n}`));

  return (
    <section
      role="note"
      aria-label={tr('A letter for you', 'Ein Brief für dich')}
      className={`relative text-left p-5 pr-10 mb-4 rm-letter ${warm ? 'rounded-2xl bg-[#fffaf0] border border-[#e6dac8]' : 'w-full max-w-2xl mx-auto border-4 border-double border-retro-ink bg-[#fffaf0]'}`}
    >
      <button onClick={() => setOpen(false)} aria-label={tr('Put the letter away', 'Brief weglegen')} className="absolute top-2 right-3 text-xl leading-none">
        ✕
      </button>
      <p className="retro-serif italic text-lg mb-2">
        ✉️ {name ? tr(`Dear ${name},`, `Hallo ${name},`) : tr('Hello again,', 'Hallo, schön dich zu sehen,')}
      </p>
      <p className="mb-2">
        {tr(
          `how lovely that you’re back! It has been ${away} days. While you were away:`,
          `wie schön, dass du wieder da bist! ${away} Tage ist es her. Seitdem ist einiges passiert:`
        )}
      </p>
      {items.length > 0 ? (
        <ul className="list-disc pl-5 space-y-1 mb-2">
          {items.map((i) => (
            <li key={i}>{i}</li>
          ))}
        </ul>
      ) : (
        <p className="mb-2">{tr('the tea kept warm for you.', 'der Tee ist für dich warm geblieben.')}</p>
      )}
      <p className="retro-serif italic">{tr('Your living room', 'Deine Stube')}</p>
    </section>
  );
};
