import React from 'react';
import { GoogleUser, SpotifyUser } from '../types';
import { GoogleAuthStatus } from '../hooks/useGoogleAuth';
import { SpotifyAuthStatus } from '../hooks/useSpotifyAuth';
import { GoogleAuthControl, DriveSyncState } from './GoogleAuthControl';
import { SpotifyAuthControl } from './SpotifyAuthControl';
import { tr } from '../lib/i18n';

// Fixed bottom-left stack for both social logins — one shared position so a
// second pill doesn't have to guess the first one's height. The red Feedback
// button sits at the very bottom, under the sign-out buttons (Marco,
// 2026-10-14; before, it was at the top, where the music controls are now).
export const AccountControls: React.FC<{
  googleStatus: GoogleAuthStatus;
  googleUser: GoogleUser | null;
  driveSyncState: DriveSyncState;
  onGoogleSignIn: () => void;
  onGoogleSignOut: () => void;
  spotifyStatus: SpotifyAuthStatus;
  spotifyUser: SpotifyUser | null;
  onSpotifySignIn: () => void;
  onSpotifySignOut: () => void;
  onFeedback: () => void;
  visible: boolean;
  /** Retro Warm: above its bottom navigation instead of behind it. */
  raised?: boolean;
}> = ({
  googleStatus, googleUser, driveSyncState, onGoogleSignIn, onGoogleSignOut,
  spotifyStatus, spotifyUser, onSpotifySignIn, onSpotifySignOut,
  onFeedback, visible, raised = false,
}) => (
  <div
    className={`rm-account rm-fixed fixed left-4 md:left-10 flex flex-col items-start gap-2 ${
      raised ? 'bottom-[calc(5.5rem+env(safe-area-inset-bottom))] z-[61]' : 'bottom-2 z-50'
    } ${visible ? '' : 'pointer-events-none'}`}
  >
    <GoogleAuthControl
      status={googleStatus}
      user={googleUser}
      syncState={driveSyncState}
      onSignIn={onGoogleSignIn}
      onSignOut={onGoogleSignOut}
      visible={visible}
    />
    <SpotifyAuthControl
      status={spotifyStatus}
      user={spotifyUser}
      onSignIn={onSpotifySignIn}
      onSignOut={onSpotifySignOut}
      visible={visible}
    />
    <button
      type="button"
      onClick={onFeedback}
      tabIndex={visible ? 0 : -1}
      title={tr('Give feedback', 'Feedback geben')}
      className={`h-10 px-3 rounded-full bg-[#c62828] text-white border-2 border-retro-ink retro-button flex items-center gap-1.5 text-sm font-bold hover:bg-[#a51f1f] transition-opacity duration-300 ${
        visible ? 'opacity-100' : 'opacity-0 pointer-events-none'
      }`}
    >
      <span aria-hidden="true">✉️</span>
      <span>Feedback</span>
    </button>
  </div>
);
