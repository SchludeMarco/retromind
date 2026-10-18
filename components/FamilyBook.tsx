import React, { useEffect, useState } from 'react';
import { tr, LOCALE } from '../lib/i18n';
import { familyQuestion, weekKey } from '../lib/dailyQuestion';
import { deleteAnswer, FamilyAnswer, loadWeek, saveAnswer, setFamilyConsent, useFamilyConsent } from '../lib/familyBook';
import { playChime } from '../lib/uiSounds';
import { MemoryAnswer } from './MemoryAnswer';

// The family book (api/_family.js, served at /api/family): one question a week for everyone Marco
// invited, and everybody reads everybody's answers. The strongest reason to
// come back is other people (tester feedback, 2026-10-18). Writing needs a
// one-time agreement, because the answer and first name then lie on the
// RetroMind server for all guests to read.
export const FamilyBook: React.FC<{ warm: boolean; userName: string }> = ({ warm, userName }) => {
  const thisWeek = weekKey();
  const [week, setWeek] = useState(thisWeek);
  const [answers, setAnswers] = useState<FamilyAnswer[] | null>(null);
  const [weeks, setWeeks] = useState<string[]>([]);
  const [ready, setReady] = useState(true);
  const consent = useFamilyConsent();
  const [agree, setAgree] = useState(false);
  const [name, setName] = useState(userName);
  const [draft, setDraft] = useState('');
  const [editing, setEditing] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    let alive = true;
    setAnswers(null);
    loadWeek(week).then((d) => {
      if (!alive) return;
      setReady(d.ready);
      setAnswers(d.answers);
      if (d.weeks) setWeeks(d.weeks);
    });
    return () => {
      alive = false;
    };
  }, [week]);

  useEffect(() => {
    if (userName && !name) setName(userName);
  }, [userName]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!ready) return null;
  const mine = answers?.find((a) => a.mine);
  const current = week === thisWeek;
  // The question as it was asked that week (stored with the answers), else this week's.
  const question = answers?.find((a) => a.question)?.question || familyQuestion(week);
  const pastWeeks = weeks.filter((w) => w < thisWeek);
  const idx = pastWeeks.indexOf(week);
  const older = current ? pastWeeks[pastWeeks.length - 1] : idx > 0 ? pastWeeks[idx - 1] : undefined;
  const newer = current ? undefined : idx >= 0 && idx < pastWeeks.length - 1 ? pastWeeks[idx + 1] : thisWeek;
  const fmtWeek = (w: string) => new Date(`${w}T12:00:00`).toLocaleDateString(LOCALE, { day: 'numeric', month: 'long' });

  const submit = async () => {
    if (!draft.trim() || !name.trim()) return;
    if (!consent) {
      if (!agree) return;
      setFamilyConsent(true);
    }
    setBusy(true);
    setError(false);
    try {
      const d = await saveAnswer(week, name.trim(), draft.trim(), familyQuestion(week));
      setAnswers(d.answers);
      if (!weeks.includes(week)) setWeeks([...weeks, week].sort());
      setEditing(false);
      playChime();
    } catch {
      setError(true);
    } finally {
      setBusy(false);
    }
  };

  const remove = async () => {
    setBusy(true);
    try {
      const d = await deleteAnswer(week);
      setAnswers(d.answers);
      setDraft('');
    } catch {
      setError(true);
    } finally {
      setBusy(false);
    }
  };

  const showForm = current && (!mine || editing);
  const btn = warm ? 'rounded-xl' : 'border-2 border-retro-ink';

  return (
    <section
      aria-labelledby="rm-family-q"
      className={warm ? 'rounded-2xl bg-white border border-[#e6dac8] p-5 md:p-6 text-left' : 'retro-card w-full max-w-2xl mx-auto mb-6 p-6 bg-white text-left'}
    >
      <p className="text-xs uppercase tracking-widest font-bold text-retro-amber-dark mb-1">
        👪 {tr('Family book', 'Familienbuch')} · {current ? tr('question of the week', 'Frage der Woche') : tr(`week of ${fmtWeek(week)}`, `Woche vom ${fmtWeek(week)}`)}
      </p>
      <h2 id="rm-family-q" className={`${warm ? 'text-xl md:text-2xl' : 'text-2xl'} retro-serif mb-2`}>
        {question}
      </h2>
      <p className="text-sm text-retro-brown mb-4">
        {tr(
          'Everyone invited to RetroMind answers the same question this week, and everyone can read all the answers. A new question comes every Monday.',
          'Alle, die zu RetroMind eingeladen sind, beantworten diese Woche dieselbe Frage, und alle können alle Antworten lesen. Jeden Montag kommt eine neue.'
        )}
      </p>

      {answers === null ? (
        <p className="text-sm italic text-retro-brown mb-4">{tr('Opening the book …', 'Das Buch wird aufgeschlagen …')}</p>
      ) : answers.length === 0 ? (
        <p className="text-sm italic text-retro-brown mb-4">
          {current ? tr('No answers yet. Be the first!', 'Noch keine Antworten. Mach den Anfang!') : tr('No answers that week.', 'In dieser Woche gab es keine Antworten.')}
        </p>
      ) : (
        <ul className="space-y-3 mb-4">
          {answers.map((a, i) => (
            <li key={`${a.name}-${a.at}-${i}`} className={`p-3 ${warm ? 'rounded-xl' : 'border-l-4 border-retro-amber'} ${a.mine ? 'bg-retro-highlight' : 'bg-retro-cream'}`}>
              <p className="text-xs font-bold uppercase text-retro-tan mb-1">
                {a.name}
                {a.mine && tr(' (you)', ' (du)')} · {new Date(a.at).toLocaleDateString(LOCALE)}
              </p>
              <p className="whitespace-pre-wrap leading-relaxed">{a.text}</p>
            </li>
          ))}
        </ul>
      )}

      {current && mine && !editing && (
        <div className="flex flex-wrap gap-3 mb-4 text-sm">
          <button onClick={() => { setDraft(mine.text); setName(mine.name); setEditing(true); }} className="underline font-semibold">
            ✏️ {tr('Change my answer', 'Meine Antwort ändern')}
          </button>
          <button onClick={remove} disabled={busy} className="underline font-semibold">
            🗑 {tr('Delete my answer', 'Meine Antwort löschen')}
          </button>
        </div>
      )}

      {showForm && answers !== null && (
        <div className="mb-4">
          <MemoryAnswer value={draft} onChange={setDraft} placeholder={tr('Your answer for the family …', 'Deine Antwort für die Familie …')} />
          <label className="block text-sm font-semibold mt-3">
            {tr('Shown as', 'Erscheint als')}
            <input
              value={name}
              onChange={(e) => setName(e.target.value.slice(0, 40))}
              placeholder={tr('Your first name', 'Dein Vorname')}
              className="block w-full mt-1 p-2 border-2 border-retro-ink bg-white font-normal"
            />
          </label>
          {!consent && (
            <label className="flex gap-2 items-start text-sm mt-3">
              <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} className="mt-1 w-5 h-5 shrink-0" />
              <span>
                {tr(
                  'I agree that my answer and the name above are stored on the RetroMind server (in the EU) and that everyone invited to RetroMind can read them. I can change or delete my answer at any time.',
                  'Ich bin einverstanden, dass meine Antwort und der Name oben auf dem RetroMind-Server (in der EU) gespeichert werden und alle zu RetroMind Eingeladenen sie lesen können. Ich kann meine Antwort jederzeit ändern oder löschen.'
                )}
              </span>
            </label>
          )}
          <button
            onClick={submit}
            disabled={busy || !draft.trim() || !name.trim() || (!consent && !agree)}
            className={`retro-button mt-3 px-5 py-2 font-bold text-white bg-retro-amber-dark disabled:opacity-50 ${btn}`}
          >
            {busy ? tr('Saving …', 'Speichere …') : tr('Write it in the family book', 'Ins Familienbuch schreiben')}
          </button>
          {error && <p className="text-sm text-red-700 mt-2">{tr('That didn’t work. Please try again in a moment.', 'Das hat nicht geklappt. Bitte gleich noch einmal versuchen.')}</p>}
        </div>
      )}

      {(older || newer) && (
        <div className="flex justify-between text-sm font-semibold">
          {older ? (
            <button onClick={() => setWeek(older)} className="underline">
              ◀ {tr('Earlier week', 'Frühere Woche')}
            </button>
          ) : (
            <span />
          )}
          {newer && (
            <button onClick={() => setWeek(newer)} className="underline">
              {newer === thisWeek ? tr('This week', 'Diese Woche') : tr('Later week', 'Spätere Woche')} ▶
            </button>
          )}
        </div>
      )}
    </section>
  );
};
