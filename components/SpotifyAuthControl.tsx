import React from 'react';
import { SpotifyUser } from '../types';
import { SpotifyAuthStatus } from '../hooks/useSpotifyAuth';

const PRODUCT_LABEL: Record<string, string> = {
  premium: '★ Premium',
  free: 'Free',
  open: 'Free',
};

export const SpotifyAuthControl: React.FC<{
  status: SpotifyAuthStatus;
  user: SpotifyUser | null;
  onSignIn: () => void;
  onSignOut: () => void;
  visible: boolean;
}> = ({ status, user, onSignIn, onSignOut, visible }) => {
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
          <span className="hidden md:inline text-retro-brown whitespace-nowrap">
            {PRODUCT_LABEL[user.product] || user.product}
          </span>
          <button
            onClick={onSignOut}
            className="retro-button border border-retro-ink px-2 py-1 font-bold bg-white shrink-0"
            aria-label="Von Spotify abmelden"
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
          {status === 'signing_in' ? 'Weiterleitung …' : status === 'error' ? 'Erneut mit Spotify anmelden' : 'Mit Spotify anmelden'}
        </button>
      )}
    </div>
  );
};
