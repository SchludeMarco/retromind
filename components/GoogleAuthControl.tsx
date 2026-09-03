import React from 'react';
import { GoogleUser } from '../types';
import { GoogleAuthStatus } from '../hooks/useGoogleAuth';

export type DriveSyncState = 'idle' | 'saving' | 'saved' | 'error';

const SYNC_LABEL: Record<DriveSyncState, string> = {
  idle: '',
  saving: '☁️ speichert …',
  saved: '☁️ in Google Drive gesichert',
  error: '⚠️ Sicherung fehlgeschlagen',
};

export const GoogleAuthControl: React.FC<{
  status: GoogleAuthStatus;
  user: GoogleUser | null;
  syncState: DriveSyncState;
  onSignIn: () => void;
  onSignOut: () => void;
}> = ({ status, user, syncState, onSignIn, onSignOut }) => {
  if (status === 'not_configured') return null;

  return (
    <div className="rm-fixed fixed bottom-10 left-4 md:left-10 z-50 flex items-center gap-2 bg-retro-cream border-2 border-retro-ink px-2 py-1 text-xs max-w-[70vw]">
      {status === 'signed_in' && user ? (
        <>
          {user.picture && (
            <img
              src={user.picture}
              alt=""
              referrerPolicy="no-referrer"
              className="w-6 h-6 rounded-full border border-retro-ink shrink-0"
            />
          )}
          <span className="font-bold truncate hidden sm:inline">{user.name}</span>
          {syncState !== 'idle' && (
            <span className="hidden md:inline text-retro-brown whitespace-nowrap">{SYNC_LABEL[syncState]}</span>
          )}
          <button
            onClick={onSignOut}
            className="retro-button border border-retro-ink px-2 py-1 font-bold bg-white shrink-0"
            aria-label="Von Google abmelden"
          >
            Abmelden
          </button>
        </>
      ) : (
        <button
          onClick={onSignIn}
          disabled={status === 'signing_in'}
          className="retro-button border border-retro-ink px-2 py-1 font-bold bg-white disabled:opacity-60"
        >
          {status === 'signing_in' ? 'Anmelden …' : status === 'error' ? 'Erneut mit Google anmelden' : 'Mit Google anmelden'}
        </button>
      )}
    </div>
  );
};
