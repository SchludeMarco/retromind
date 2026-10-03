import React, { useEffect } from 'react';
import { Cloud } from '../lib/useCloudSync';
import { ArcadeState, Palette } from '../lib/useArcadeState';
import { toggleMuted, useMuted } from '../../lib/mute';

export const PALETTES: { id: Palette; label: string }[] = [
  { id: 'arcade', label: 'ARCADE' },
  { id: 'gameboy', label: 'HANDHELD' },
  { id: 'amber', label: 'BERNSTEIN' },
];

const SYNC_TEXT: Record<Cloud['sync'], string> = {
  idle: '',
  loading: 'Lade deinen Spielstand …',
  saving: 'Speichert …',
  saved: '✓ Spielstand, Sammlung und Vorlieben sind in deinem Google Drive gesichert.',
  error: '⚠ Sicherung gerade nicht möglich. Dein Profil bleibt auf diesem Gerät.',
};

interface Props {
  cloud: Cloud;
  state: ArcadeState;
  set: <K extends keyof ArcadeState>(key: K, value: ArcadeState[K]) => void;
  onClose: () => void;
}

// Settings: the optional Google account (which brings score, collection and
// preferences to every device) plus sound and screen colour.
export const Settings: React.FC<Props> = ({ cloud, state, set, onClose }) => {
  const muted = useMuted();
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const signedIn = cloud.status === 'signed_in';
  return (
    <div className="overlay" onClick={onClose}>
      <div
        className="dialog settings-dialog"
        role="dialog"
        aria-modal="true"
        aria-label="Einstellungen"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="pixel-font">⚙ EINSTELLUNGEN</h2>
        <button className="px-btn close-x" onClick={onClose} aria-label="Schließen" data-nav>
          ✕
        </button>

        <section>
          <h3 className="pixel-font">KONTO</h3>
          {cloud.status === 'not_configured' ? (
            <p className="dim">Die Anmeldung ist auf dieser Seite noch nicht eingerichtet. Dein Profil bleibt auf diesem Gerät.</p>
          ) : signedIn ? (
            <>
              <p className="pixel-font cloud-user">
                ANGEMELDET ALS {(cloud.user?.name ?? '').toUpperCase()}
              </p>
              {cloud.user?.email && <p className="dim">{cloud.user.email}</p>}
              {SYNC_TEXT[cloud.sync] && <p role="status">{SYNC_TEXT[cloud.sync]}</p>}
              <button className="px-btn" onClick={cloud.signOut} data-nav>
                ABMELDEN
              </button>
              <p className="dim">Beim Abmelden bleibt dein Profil auf diesem Gerät erhalten.</p>
            </>
          ) : (
            <>
              <p>
                Melde dich mit Google an, dann sind Highscore, Sammlung, Erfolge und deine Einstellungen auf jedem Gerät
                da. Gespeichert wird in deinem eigenen Google Drive, in einem privaten Ordner, den nur RetroMind sieht.
              </p>
              <button
                className="px-btn big"
                onClick={cloud.signIn}
                disabled={cloud.status === 'signing_in'}
                data-nav
              >
                {cloud.status === 'signing_in'
                  ? 'ANMELDEN …'
                  : cloud.status === 'error'
                    ? 'ERNEUT MIT GOOGLE ANMELDEN'
                    : 'MIT GOOGLE ANMELDEN'}
              </button>
              <p className="dim">
                Ohne Anmeldung funktioniert alles wie bisher. Hast du schon auf einem anderen Gerät gespielt, werden
                beide Spielstände zusammengeführt, es geht nichts verloren.
              </p>
            </>
          )}
        </section>

        <section>
          <h3 className="pixel-font">TON</h3>
          <div className="settings-row">
            <button className="px-btn" aria-pressed={state.music} onClick={() => set('music', !state.music)} data-nav>
              ♪ MUSIK {state.music ? 'AN' : 'AUS'}
            </button>
            <button className="px-btn" aria-pressed={state.sfx} onClick={() => set('sfx', !state.sfx)} data-nav>
              SFX {state.sfx ? 'AN' : 'AUS'}
            </button>
            <button className="px-btn" aria-pressed={muted} onClick={toggleMuted} data-nav>
              {muted ? 'TON AUS' : 'TON AN'}
            </button>
          </div>
        </section>

        <section>
          <h3 className="pixel-font">BILDSCHIRM</h3>
          <div className="settings-row">
            {PALETTES.map((p) => (
              <button
                key={p.id}
                className="px-btn"
                aria-pressed={state.palette === p.id}
                onClick={() => set('palette', p.id)}
                data-nav
              >
                {p.label}
              </button>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};
