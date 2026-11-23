import React, { useRef } from 'react';
import { tr } from '../lib/i18n';
import { MIN_TRAVEL_DATE, todayIso } from '../lib/travelDate';
import { TimeCircuitRow, type Stamp } from './ArrivalShow';

// The red "destination time" row of the time circuits, settable (Marco,
// 2026-11-23: the date you travel to should be adjustable on the main
// screen). The whole row is the button: a tap opens the phone's or
// browser's own date picker (a real <input type="date"> lies invisibly on
// top, so typing and screen readers work too). The chosen date furnishes the
// Stube and picks the music (lib/travelDate.ts, App.tsx).

function toStamp(date: string): Stamp | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(date);
  if (!m) return null;
  return { year: Number(m[1]), month: Number(m[2]) - 1, day: Number(m[3]) };
}

export const TravelDatePicker: React.FC<{
  /** "YYYY-MM-DD" shown as the destination. */
  value: string;
  onChange: (date: string) => void;
  /** Whether the shown date was picked (then "back to …" appears). */
  chosen?: boolean;
  /** Back to the default (the birthday, else 30.12.1989). */
  onReset?: () => void;
  /** What the default is, for the reset button. */
  resetLabel?: string;
  /** The small version on the welcome screen. */
  mini?: boolean;
  /** Extra rows below (the present time on the welcome screen). */
  children?: React.ReactNode;
  className?: string;
}> = ({ value, onChange, chosen, onReset, resetLabel, mini, children, className = '' }) => {
  const input = useRef<HTMLInputElement>(null);
  // Desktop browsers only open the calendar from their small icon; open it
  // from anywhere on the row instead.
  const openPicker = () => {
    try {
      input.current?.showPicker?.();
    } catch {
      /* not allowed here: the input still takes the tap or typing */
    }
  };
  return (
    <div className={`rm-travel-date ${className}`}>
      <div className={`rm-tc ${mini ? 'rm-tc-mini' : 'rm-tc-panel'} relative`} role="group" aria-label={tr('Time circuits', 'Zeitschaltkreise')}>
        <div className="rm-travel-date-row" onClick={openPicker}>
          <TimeCircuitRow label={tr('Destination time ✎', 'Zielzeit ✎')} stamp={toStamp(value)} tone="red" />
          <input
            ref={input}
            type="date"
            className="rm-travel-date-input"
            aria-label={tr('Destination time: the date you travel to', 'Zielzeit: das Datum, zu dem du reist')}
            value={value}
            min={MIN_TRAVEL_DATE}
            max={todayIso()}
            onChange={(e) => {
              if (e.target.value) onChange(e.target.value);
            }}
          />
        </div>
        {children}
      </div>
      {chosen && onReset && (
        <button type="button" className="rm-travel-date-reset" onClick={onReset}>
          ↺ {resetLabel ?? tr('Back to the default', 'Zurück zum Standard')}
        </button>
      )}
    </div>
  );
};
