import React, { useRef } from 'react';
import { INITIALS_CHARS, INITIALS_LENGTH } from '../lib/initials';
import { InitialsConflict } from '../hooks/useInitialsCloud';
import { tr } from '../lib/i18n';
import './initialsPicker.css';

// The tag entry of an old high score table: three slots, each scrolled with
// ▲ and ▼ through A–Z and 0–9, or simply typed. Shared by both editions
// (Zeitreise settings, Gaming settings and the mini games' high score
// tables), so it brings its own arcade look. The slots are text fields on
// purpose: phones open their keyboard, and the Gaming edition's arrow-key
// menu navigation leaves a focused text field alone.

const step = (ch: string, by: number) => {
  const i = INITIALS_CHARS.indexOf(ch);
  return INITIALS_CHARS[(i + by + INITIALS_CHARS.length) % INITIALS_CHARS.length];
};

export const InitialsPicker: React.FC<{
  value: string;
  onChange: (value: string) => void;
  /** Enter in a slot, e.g. to save. */
  onEnter?: () => void;
  autoFocus?: boolean;
}> = ({ value, onChange, onEnter, autoFocus }) => {
  const chars = (value + 'AAA').slice(0, INITIALS_LENGTH).split('');
  const slots = useRef<(HTMLInputElement | null)[]>([]);

  const setAt = (i: number, ch: string) => {
    const next = [...chars];
    next[i] = ch;
    onChange(next.join(''));
  };
  const focus = (i: number) => {
    const el = slots.current[Math.max(0, Math.min(INITIALS_LENGTH - 1, i))];
    el?.focus();
    el?.select();
  };

  const onKey = (i: number) => (e: React.KeyboardEvent<HTMLInputElement>) => {
    const moves: Record<string, () => void> = {
      ArrowUp: () => setAt(i, step(chars[i], 1)),
      ArrowDown: () => setAt(i, step(chars[i], -1)),
      ArrowLeft: () => focus(i - 1),
      ArrowRight: () => focus(i + 1),
      Backspace: () => focus(i - 1),
      Enter: () => onEnter?.(),
    };
    const move = moves[e.key];
    if (!move) return;
    e.preventDefault();
    e.stopPropagation();
    move();
  };

  const onType = (i: number) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const typed = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
    if (!typed) return;
    setAt(i, typed[typed.length - 1]);
    if (i < INITIALS_LENGTH - 1) focus(i + 1);
  };

  return (
    <div className="initials-picker" role="group" aria-label={tr('Your three initials', 'Dein Kürzel aus drei Zeichen')}>
      {chars.map((ch, i) => (
        <div className="initials-slot" key={i}>
          <button type="button" className="initials-step" onClick={() => setAt(i, step(ch, 1))} aria-label={tr(`Character ${i + 1} up`, `Zeichen ${i + 1} hoch`)} tabIndex={-1}>
            ▲
          </button>
          <input
            ref={(el) => {
              slots.current[i] = el;
            }}
            className="initials-char"
            value={ch}
            onChange={onType(i)}
            onKeyDown={onKey(i)}
            onFocus={(e) => e.currentTarget.select()}
            autoFocus={autoFocus && i === 0}
            inputMode="text"
            autoCapitalize="characters"
            autoComplete="off"
            autoCorrect="off"
            spellCheck={false}
            aria-label={tr(`Character ${i + 1} of 3`, `Zeichen ${i + 1} von 3`)}
          />
          <button type="button" className="initials-step" onClick={() => setAt(i, step(ch, -1))} aria-label={tr(`Character ${i + 1} down`, `Zeichen ${i + 1} runter`)} tabIndex={-1}>
            ▼
          </button>
        </div>
      ))}
    </div>
  );
};

/**
 * The question after a Google sign-in when the account holds a different
 * tag than this device: the cloud tag wins, but only with a yes.
 */
export const InitialsCloudAsk: React.FC<{
  conflict: InitialsConflict;
  onTakeCloud: () => void;
  onKeepLocal: () => void;
}> = ({ conflict, onTakeCloud, onKeepLocal }) => (
  <div className="initials-ask-backdrop">
    <div className="initials-ask" role="alertdialog" aria-modal="true" aria-labelledby="initials-ask-title">
      <p id="initials-ask-title" className="initials-ask-title">
        {tr('YOUR INITIALS', 'DEIN KÜRZEL')}
      </p>
      <p>
        {tr(
          `Your Google account has the initials ${conflict.cloud}, this device has ${conflict.local}. Use ${conflict.cloud} here too?`,
          `In deinem Google-Konto steht das Kürzel ${conflict.cloud}, auf diesem Gerät ${conflict.local}. Soll hier auch ${conflict.cloud} gelten?`
        )}
      </p>
      <div className="initials-ask-tags" aria-hidden="true">
        <span>
          <small>GOOGLE</small>
          {conflict.cloud}
        </span>
        <span>
          <small>{tr('THIS DEVICE', 'DIESES GERÄT')}</small>
          {conflict.local}
        </span>
      </div>
      <div className="initials-ask-buttons">
        <button type="button" className="initials-ask-yes" onClick={onTakeCloud} autoFocus data-nav>
          {tr(`Yes, use ${conflict.cloud}`, `Ja, ${conflict.cloud} nehmen`)}
        </button>
        <button type="button" onClick={onKeepLocal} data-nav>
          {tr(`No, keep ${conflict.local}`, `Nein, ${conflict.local} behalten`)}
        </button>
      </div>
    </div>
  </div>
);
