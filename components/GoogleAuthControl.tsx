import React from 'react';
import { GoogleUser } from '../types';
import { GoogleAuthStatus } from '../hooks/useGoogleAuth';
import { warmUpGoogle } from '../lib/googleAuth';
import { tr } from '../lib/i18n';

export type DriveSyncState = 'idle' | 'saving' | 'saved' | 'error';

const SYNC_LABEL: Record<DriveSyncState, string> = {
  idle: '',
  saving: tr('☁️ saving …', '☁️ speichert …'),
  saved: tr('☁️ backed up to Google Drive', '☁️ in Google Drive gesichert'),
  error: tr('⚠️ Backup failed', '⚠️ Sicherung fehlgeschlagen'),
};

export const GoogleAuthControl: React.FC<{
  status: GoogleAuthStatus;
  user: GoogleUser | null;
  syncState: DriveSyncState;
  onSignIn: () => void;
  onSignOut: () => void;
  visible: boolean;
}> = ({ status, user, syncState, onSignIn, onSignOut, visible }) => {
  if (status === 'not_configured') return null;

  return (
    <div
      className={`flex items-center gap-2 bg-retro-cream border-2 border-retro-ink px-2 py-1 text-xs max-w-[70vw] transition-opacity duration-300 ${
        visible ? 'opacity-100' : 'opacity-0 pointer-events-none'
      }`}
    >
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
            aria-label={tr('Sign out of Google', 'Von Google abmelden')}
          >
            {tr('Sign out', 'Abmelden')}
          </button>
        </>
      ) : (
        <button
          onClick={onSignIn}
          // Google's script only loads once someone reaches for this button.
          onPointerEnter={warmUpGoogle}
          onPointerDown={warmUpGoogle}
          onFocus={warmUpGoogle}
          disabled={status === 'signing_in'}
          className="retro-button border border-retro-ink px-2 py-1 font-bold bg-white disabled:opacity-60"
        >
          {status === 'signing_in'
            ? tr('Signing in …', 'Anmelden …')
            : status === 'error'
            ? tr('Sign in with Google again', 'Erneut mit Google anmelden')
            : tr('Sign in with Google', 'Mit Google anmelden')}
        </button>
      )}
    </div>
  );
};
