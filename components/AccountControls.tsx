import React from 'react';
import { GoogleUser, SpotifyUser } from '../types';
import { GoogleAuthStatus } from '../hooks/useGoogleAuth';
import { SpotifyAuthStatus } from '../hooks/useSpotifyAuth';
import { GoogleAuthControl, DriveSyncState } from './GoogleAuthControl';
import { SpotifyAuthControl } from './SpotifyAuthControl';

// Fixed bottom-left stack for both social logins — one shared position so a
// second pill doesn't have to guess the first one's height.
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
  visible: boolean;
}> = ({
  googleStatus, googleUser, driveSyncState, onGoogleSignIn, onGoogleSignOut,
  spotifyStatus, spotifyUser, onSpotifySignIn, onSpotifySignOut,
  visible,
}) => (
  <div className="rm-fixed fixed bottom-2 left-4 md:left-10 z-50 flex flex-col items-start gap-2">
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
  </div>
);
