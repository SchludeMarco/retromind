import React, { useEffect } from 'react';
import { Cloud } from '../lib/useCloudSync';

const SYNC_TEXT: Record<Cloud['sync'], string> = {
  idle: '',
  loading: 'Lade Spielstand aus der Cloud …',
  saving: 'Speichert …',
  saved: '✓ In deinem Google Drive gesichert.',
  error: '⚠ Sicherung gerade nicht möglich. Dein Profil bleibt auf diesem Gerät.',
};

// The optional cloud backup, explained in one dialog: the profile always
// stays on this device; Google only adds a copy for other devices.
export const CloudSave: React.FC<{ cloud: Cloud; onClose: () => void }> = ({ cloud, onClose }) => {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const signedIn = cloud.status === 'signed_in';
  return (
    <div className="overlay" onClick={onClose}>
      <div
        className="dialog cloud-dialog"
        role="dialog"
        aria-modal="true"
        aria-label="Cloud-Sicherung"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="pixel-font">☁ CLOUD-SICHERUNG</h2>
        <button className="px-btn close-x" onClick={onClose} aria-label="Schließen" data-nav>
          ✕
        </button>
        <p>
          Dein Profil mit Sammlung, Erfolgen und Highscore liegt immer auf diesem Gerät. Optional sicherst du es
          zusätzlich in deinem eigenen Google Drive, in einem privaten Ordner, den nur RetroMind sieht. Dann hast du
          es auf jedem Gerät, auf dem du dich anmeldest.
        </p>
        {signedIn ? (
          <>
            <p className="pixel-font cloud-user">
              ANGEMELDET ALS {(cloud.user?.name ?? '').toUpperCase()}
            </p>
            {SYNC_TEXT[cloud.sync] && <p role="status">{SYNC_TEXT[cloud.sync]}</p>}
            <button className="px-btn" onClick={cloud.signOut} data-nav>
              ABMELDEN
            </button>
            <p className="dim">Beim Abmelden bleibt dein Profil auf diesem Gerät erhalten.</p>
          </>
        ) : (
          <>
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
                  : 'MIT GOOGLE SICHERN'}
            </button>
            <p className="dim">
              Ohne Anmeldung funktioniert alles wie bisher. Auf einem zweiten Gerät werden beide Spielstände
              zusammengeführt, es geht nichts verloren.
            </p>
          </>
        )}
      </div>
    </div>
  );
};
