import React from 'react';
import { AppPhase } from '../types';
import { PHASES } from '../lib/session';
import { toggleMuted, useMuted } from '../lib/mute';

// The app frame of the "Retro Warm" design (lib/theme.ts), after the Google
// Stitch mock-ups: a top bar with logo, sound switch, settings and account,
// a bottom navigation with the four big areas of the journey, and a stepper
// showing which station of the journey you are at. The other designs keep
// their floating buttons and the thin progress line instead.

type IconName = 'start' | 'journey' | 'explore' | 'book' | 'settings' | 'person' | 'wave' | 'check' | 'chat' | 'close' | 'mail';

export const Icon: React.FC<{ name: IconName; className?: string }> = ({ name, className = 'w-6 h-6' }) => {
  const common = {
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.8,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    className,
    'aria-hidden': true,
  };
  switch (name) {
    case 'start': // hourglass
      return (
        <svg {...common}>
          <path d="M6 3h12M6 21h12M7 3c0 5 10 5 10 9s-10 4-10 9M17 3c0 5-10 5-10 9s10 4 10 9" />
        </svg>
      );
    case 'journey': // open book with bookmark
      return (
        <svg {...common}>
          <path d="M3 5.5C5.5 4 9 4 12 6c3-2 6.5-2 9-.5V19c-2.5-1.5-6-1.5-9 .5-3-2-6.5-2-9-.5z" />
          <path d="M12 6v13.5M15.5 4.7V10l1.5-1 1.5 1V4.6" />
        </svg>
      );
    case 'explore': // compass
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="9" />
          <path d="M15.5 8.5l-2 5-5 2 2-5z" />
        </svg>
      );
    case 'book': // memory book
      return (
        <svg {...common}>
          <path d="M3 6c3-1.5 6-1.5 9 0 3-1.5 6-1.5 9 0v13c-3-1.5-6-1.5-9 0-3-1.5-6-1.5-9 0z" />
          <path d="M12 6v13M6 9.5h3M6 12.5h3M15 9.5h3M15 12.5h3" />
        </svg>
      );
    case 'settings':
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="3" />
          <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z" />
        </svg>
      );
    case 'person':
      return (
        <svg {...common}>
          <circle cx="12" cy="8" r="4" />
          <path d="M4 21c1-4 4.5-6 8-6s7 2 8 6" />
        </svg>
      );
    case 'wave':
      return (
        <svg {...common}>
          <path d="M3 10v4M7 7v10M11 4v16M15 8v8M19 10v4" />
        </svg>
      );
    case 'check':
      return (
        <svg {...common} strokeWidth={2.6}>
          <path d="M5 12.5l4.5 4.5L19 7.5" />
        </svg>
      );
    case 'chat':
      return (
        <svg {...common}>
          <path d="M4 5h16v11H9l-5 4z" />
        </svg>
      );
    case 'mail':
      return (
        <svg {...common}>
          <rect x="3" y="5" width="18" height="14" rx="2" />
          <path d="M3.5 6.5L12 13l8.5-6.5" />
        </svg>
      );
    case 'close':
      return (
        <svg {...common} strokeWidth={2.2}>
          <path d="M6 6l12 12M18 6L6 18" />
        </svg>
      );
  }
};

export const PHASE_LABEL: Record<AppPhase, string> = {
  intro: 'Start',
  onboarding: 'Dein Profil',
  induction: 'Zeitreise',
  exploration: 'Erkunden',
  diary: 'Tagebuch',
  book: 'Erinnerungsbuch',
  finish: 'Geschafft',
};

const STEP_LABEL: Record<AppPhase, string> = {
  intro: 'Start',
  onboarding: 'Profil',
  induction: 'Eindrücke',
  exploration: 'Erkunden',
  diary: 'Tagebuch',
  book: 'Buch',
  finish: 'Ende',
};

export const WarmTopBar: React.FC<{
  phase: AppPhase;
  showActions: boolean;
  hasUnseenNews: boolean;
  accountOpen: boolean;
  onOpenSettings: () => void;
  onOpenFeedback: () => void;
  onToggleAccount: () => void;
}> = ({ phase, showActions, hasUnseenNews, accountOpen, onOpenSettings, onOpenFeedback, onToggleAccount }) => {
  const muted = useMuted();
  return (
    <header className="rm-fixed fixed top-0 inset-x-0 z-[60] bg-retro-paper/95 backdrop-blur border-b border-[#e6dac8]">
      <div className="max-w-6xl mx-auto px-4 md:px-8 h-16 flex items-center gap-3">
        <img src="/retromind-logo-header.webp" alt="" width={640} height={756} className="w-9 h-auto flex-shrink-0" />
        <div className="leading-tight min-w-0 flex-grow">
          <span className="block font-serif font-bold text-lg md:text-xl tracking-tight text-retro-amber-dark">RETROMIND</span>
          <span className="block text-xs text-retro-brown truncate">{PHASE_LABEL[phase]}</span>
        </div>
        <button
          onClick={toggleMuted}
          aria-pressed={muted}
          aria-label={muted ? 'Ton einschalten' : 'Stummschalten'}
          className={`h-10 px-3 rounded-full flex items-center gap-1.5 text-sm font-semibold flex-shrink-0 ${
            muted ? 'bg-[#eee0d6] text-retro-brown' : 'bg-[#4b7b72]/15 text-[#34645c]'
          }`}
        >
          <Icon name="wave" className="w-5 h-5" />
          <span className="hidden sm:inline">{muted ? 'Ton aus' : 'Tonband'}</span>
          {muted && <span className="sm:hidden">aus</span>}
        </button>
        <button
          onClick={onOpenFeedback}
          aria-label="Feedback geben"
          title="Feedback geben"
          className="w-10 h-10 rounded-full flex items-center justify-center text-retro-ink hover:bg-retro-highlight flex-shrink-0"
        >
          <Icon name="mail" />
        </button>
        {showActions && (
          <>
            <button
              onClick={onOpenSettings}
              aria-label="App-Einstellungen öffnen"
              className="relative w-10 h-10 rounded-full flex items-center justify-center text-retro-ink hover:bg-retro-highlight flex-shrink-0"
            >
              <Icon name="settings" />
              {hasUnseenNews && (
                <span aria-label="neue Einträge" className="absolute top-1 right-1 w-2.5 h-2.5 rounded-full bg-red-600 border-2 border-retro-paper" />
              )}
            </button>
            <button
              onClick={onToggleAccount}
              aria-pressed={accountOpen}
              aria-label="Konten (Google, Spotify)"
              className="w-10 h-10 rounded-full flex items-center justify-center bg-retro-amber-dark text-white flex-shrink-0"
            >
              <Icon name="person" className="w-5 h-5" />
            </button>
          </>
        )}
      </div>
    </header>
  );
};

type NavTarget = 'intro' | 'induction' | 'exploration' | 'book';

const NAV: { target: NavTarget; label: string; icon: IconName; phases: AppPhase[] }[] = [
  { target: 'intro', label: 'Start', icon: 'start', phases: ['intro', 'onboarding'] },
  { target: 'induction', label: 'Zeitreise', icon: 'journey', phases: ['induction'] },
  { target: 'exploration', label: 'Erkunden', icon: 'explore', phases: ['exploration'] },
  { target: 'book', label: 'Erinnerung', icon: 'book', phases: ['diary', 'book', 'finish'] },
];

// `center` (the Spotify player bar) sits in the middle, two areas on each side.
export const WarmBottomNav: React.FC<{ phase: AppPhase; onNavigate: (target: NavTarget) => void; center?: React.ReactNode }> = ({
  phase,
  onNavigate,
  center,
}) => (
  <nav
    aria-label="Hauptnavigation"
    className="rm-fixed fixed bottom-0 inset-x-0 z-[60] bg-retro-paper-white/95 backdrop-blur border-t border-[#e6dac8] pb-[env(safe-area-inset-bottom)]"
  >
    <div className={`mx-auto grid ${center ? 'max-w-2xl grid-cols-[1fr_1fr_auto_1fr_1fr]' : 'max-w-xl grid-cols-4'}`}>
      {NAV.flatMap((item, i) => {
        const active = item.phases.includes(phase);
        const button = (
          <button
            key={item.target}
            onClick={() => onNavigate(item.target)}
            aria-current={active ? 'page' : undefined}
            className={`h-16 flex flex-col items-center justify-center gap-0.5 font-semibold ${center ? 'text-[11px] sm:text-xs' : 'text-xs'} ${
              active ? 'text-retro-amber-dark' : 'text-retro-brown'
            }`}
          >
            <Icon name={item.icon} />
            {item.label}
          </button>
        );
        return i === 2 && center ? [<React.Fragment key="center">{center}</React.Fragment>, button] : [button];
      })}
    </div>
  </nav>
);

export const WarmJourneyStepper: React.FC<{ phase: AppPhase }> = ({ phase }) => {
  const index = PHASES.indexOf(phase);
  const percent = Math.round((index / (PHASES.length - 1)) * 100);
  return (
    <section aria-label="Fortschritt der Reise" className="rounded-2xl bg-retro-highlight/70 p-4 md:p-5 mt-4">
      <div className="flex items-start justify-between gap-3 mb-3">
        <p className="font-semibold leading-snug">
          Station {index + 1} von {PHASES.length}: {PHASE_LABEL[phase]}
        </p>
        <p className="text-sm text-retro-brown whitespace-nowrap">{percent}&nbsp;% geschafft</p>
      </div>
      <div className="h-1.5 rounded-full bg-[#e6dac8] overflow-hidden mb-4">
        <div className="h-full bg-retro-amber-dark rounded-full transition-all duration-500" style={{ width: `${percent}%` }} />
      </div>
      <ol className="grid grid-cols-7 gap-1">
        {PHASES.map((p, i) => {
          const done = i < index;
          const current = i === index;
          return (
            <li key={p} className="flex flex-col items-center gap-1 text-center">
              <span
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                  done
                    ? 'bg-retro-amber-dark text-white'
                    : current
                    ? 'bg-retro-amber text-white ring-4 ring-[#e8a838]/60'
                    : 'bg-[#eee0d6] text-retro-tan'
                }`}
              >
                {done ? <Icon name="check" className="w-4 h-4" /> : i + 1}
              </span>
              <span className={`hidden sm:block text-[11px] leading-tight ${current ? 'font-bold text-retro-amber-dark' : 'text-retro-brown'}`}>
                {STEP_LABEL[p]}
              </span>
            </li>
          );
        })}
      </ol>
    </section>
  );
};
