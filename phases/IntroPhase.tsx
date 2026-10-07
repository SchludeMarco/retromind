import React, { useState } from 'react';
import { AppPhase, GalleryItem, GoogleUser, SpotifyUser } from '../types';
import { DECADES_DB } from '../constants';
import { useWarmChrome } from '../lib/theme';
import { viaProxy } from '../lib/privacy';
import { GoogleAuthStatus } from '../hooks/useGoogleAuth';
import { SpotifyAuthStatus } from '../hooks/useSpotifyAuth';
import { JourneyStages } from '../components/JourneyStages';
import { GamingSignpost } from '../components/GamingSignpost';

const SPOTIFY_PRODUCT_LABEL: Record<string, string> = {
  premium: 'Spotify Premium',
  free: 'Spotify Free',
  open: 'Spotify Free',
};

export const IntroPhase: React.FC<{
  resumeTarget: AppPhase | null;
  memoriesCount: number;
  googleUser: GoogleUser | null;
  spotifyStatus: SpotifyAuthStatus;
  spotifyUser: SpotifyUser | null;
  onSpotifySignIn: () => void;
  onStart: () => void;
  onResume: () => void;
  onReset: () => void;
  focusDecade: string;
  onSelectGalleryItem: (item: GalleryItem) => void;
  diaryWritten: boolean;
  onOpenStage: (phase: AppPhase) => void;
}> = (props) => (useWarmChrome() ? <WarmIntro {...props} /> : <ClassicIntro {...props} />);

type IntroProps = React.ComponentProps<typeof IntroPhase>;

const ClassicIntro: React.FC<IntroProps> = ({
  resumeTarget, memoriesCount,
  onStart, onResume, onReset, diaryWritten, onOpenStage, focusDecade, onSelectGalleryItem, ...rest
}) => (
  <div className="flex flex-col items-center py-10 text-center animate-fadeIn">
    <div className="retro-card p-8 md:p-12 max-w-2xl bg-retro-cream">
      <h2 className="text-4xl mb-6">Willkommen, Zeitreisende:r</h2>

      {!resumeTarget && (
        <button
          onClick={onStart}
          className="retro-button bg-retro-amber text-white px-12 py-5 text-2xl font-bold hover:bg-retro-amber-dark w-full md:w-auto mb-8"
        >
          Zeitreise starten
        </button>
      )}

      {resumeTarget && (
        <div className="mb-8 border-2 border-retro-amber bg-retro-highlight p-4">
          <p className="font-bold mb-3">
            Du hast eine begonnene Reise ({memoriesCount} Erinnerung{memoriesCount === 1 ? '' : 'en'}).
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <button onClick={onResume} className="retro-button bg-retro-ink text-white px-6 py-3 font-bold">
              Weitermachen
            </button>
            <button onClick={onReset} className="px-6 py-3 border-2 border-retro-ink font-bold bg-white">
              Neu beginnen
            </button>
          </div>
        </div>
      )}

      {resumeTarget && (
        <JourneyStages
          warm={false}
          lastStage={resumeTarget}
          memoriesCount={memoriesCount}
          diaryWritten={diaryWritten}
          onOpen={onOpenStage}
        />
      )}

      <p className="text-lg mb-8 leading-relaxed">
        Öffne die Truhe deiner Kindheit. RetroMind führt dich Jahrzehnt für Jahrzehnt zurück, stellt dir
        persönliche Fragen und sammelt deine Antworten zu einem Erinnerungs-Buch.
      </p>

      <IntroExtras {...rest} />
    </div>
  </div>
);

const IntroExtras: React.FC<Pick<IntroProps, 'googleUser' | 'spotifyStatus' | 'spotifyUser' | 'onSpotifySignIn'>> = ({
  googleUser, spotifyStatus, spotifyUser, onSpotifySignIn,
}) => (
  <>
      <GamingSignpost />

      {googleUser && (
        <div className="mb-4 border-2 border-retro-ink bg-white p-4">
          <p className="font-bold">
            ☁️ Angemeldet als {googleUser.name} – deine Reise wird in deinem eigenen Google Drive gesichert.
          </p>
        </div>
      )}

      {spotifyStatus !== 'not_configured' && (
        <div className="mb-8 border-2 border-retro-ink bg-white p-4">
          {spotifyStatus === 'signed_in' && spotifyUser ? (
            <p className="font-bold">
              🎧 Angemeldet als {spotifyUser.name} ({SPOTIFY_PRODUCT_LABEL[spotifyUser.product] || spotifyUser.product}).
            </p>
          ) : (
            <>
              <p className="mb-3">
                Melde dich mit Spotify an, damit RetroMind weiß, ob du <strong>Premium</strong> hast. Das
                Hintergrund-Playlist-Embed läuft unabhängig davon (siehe Einstellungen) – dieser Login ist
                nur dafür da, dich als Person mit deinem eigenen Musikgeschmack zu kennen.
              </p>
              <button
                onClick={onSpotifySignIn}
                disabled={spotifyStatus === 'signing_in'}
                className="retro-button border-2 border-retro-ink px-6 py-3 font-bold bg-white disabled:opacity-60"
              >
                {spotifyStatus === 'signing_in'
                  ? 'Weiterleitung …'
                  : spotifyStatus === 'error'
                  ? 'Erneut mit Spotify anmelden'
                  : 'Mit Spotify anmelden'}
              </button>
            </>
          )}
        </div>
      )}

      <details className="mt-10 text-left text-sm text-retro-brown">
        <summary className="cursor-pointer font-bold uppercase tracking-widest text-xs">
          Wie RetroMind mit deinen Daten umgeht
        </summary>
        <ul className="list-disc pl-5 mt-3 space-y-1">
          <li>Profil, Antworten und Tagebuch bleiben <strong>nur in diesem Browser</strong> (localStorage).</li>
          <li>Die Anmeldung mit Google ist <strong>freiwillig</strong>. Meldest du dich an, übernimmt RetroMind Namen und Alter aus deinem Konto, und deine Reise wird zusätzlich in deinem <strong>eigenen, privaten Google-Drive</strong> gesichert (Ordner „appData", nur für RetroMind, für niemand anderen sichtbar) – so kannst du auf einem anderen Gerät weitermachen. Die Anmeldung gilt dann für alle RetroMind-Module (z.&nbsp;B. auch RetroMind – Gaming), bis du dich abmeldest. Es gibt keine zentrale RetroMind-Datenbank; deine Daten bleiben in deinem Google-Konto.</li>
          <li>Mit Spotify-Anmeldung holen wir nur deinen Namen und deinen Premium-/Free-Status ab (Scopes <code>user-read-private</code>, <code>user-read-email</code>) – wird nirgends gespeichert außer in diesem Browser, es gibt keinen eigenen RetroMind-Server dafür.</li>
          <li>Lädst du ein Foto hoch, wird es zur Beschreibung an die Google-Gemini-API gesendet (und für die optionale Video-Funktion an Veo). Sonst verlässt nichts dein Gerät.</li>
          <li>Über „Sitzung sichern" kannst du alles als Datei exportieren, über „Neu beginnen" alles löschen – bei bestehender Google-Anmeldung auch in deinem Drive.</li>
        </ul>
      </details>
  </>
);

// "Retro Warm" start page, after the Google Stitch mock-up: welcome card with
// what the journey offers, a decade overview and a strip of archive finds.
const FEATURES = [
  { icon: '✨', label: '6 Jahrzehnte, von den 60ern bis heute' },
  { icon: '📻', label: 'Popkultur-Schätze zum Erinnern' },
  { icon: '📖', label: 'Dein eigenes Erinnerungsbuch' },
];

const WarmIntro: React.FC<IntroProps> = ({
  resumeTarget, memoriesCount, onStart, onResume, onReset,
  focusDecade, onSelectGalleryItem, diaryWritten, onOpenStage, ...rest
}) => {
  const decades = Object.keys(DECADES_DB);
  const [shownDecade, setShownDecade] = useState(DECADES_DB[focusDecade] ? focusDecade : decades[0]);
  const shown = DECADES_DB[shownDecade];
  const finds = Object.values(DECADES_DB)
    .flatMap((d) => d.galleryItems)
    .filter((item) => item.image)
    .slice(0, 6);
  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-4 animate-fadeIn">
      <section className="retro-card bg-retro-paper-white p-6 md:p-8">
        <div className="flex items-center gap-3 mb-4">
          <span aria-hidden="true" className="w-12 h-12 rounded-xl bg-[#ffddaf] flex items-center justify-center text-2xl">🕰️</span>
          <div>
            <span className="block text-xs font-semibold uppercase tracking-wider text-retro-amber-dark">Erinnerungsreise</span>
            <h2 className="text-2xl md:text-3xl m-0">Willkommen, Zeitreisende:r</h2>
          </div>
        </div>
        <p className="text-lg leading-relaxed mb-5">
          Tauche ein in die Jahrzehnte deiner Kindheit und Jugend. Beantworte persönliche Fragen, entdecke
          Kult-Erinnerungen und halte deine schönsten Momente in einem bleibenden Erinnerungsbuch fest.
        </p>
        <ul className="space-y-2 mb-6">
          {FEATURES.map((f) => (
            <li key={f.label} className="flex items-center gap-3 rounded-xl bg-retro-cream px-4 py-3 text-sm font-medium">
              <span aria-hidden="true" className="text-lg">{f.icon}</span>
              {f.label}
            </li>
          ))}
        </ul>

        {resumeTarget ? (
          <div className="rounded-2xl bg-retro-highlight p-4 text-center">
            <p className="font-semibold mb-3">
              Du hast eine begonnene Reise ({memoriesCount} Erinnerung{memoriesCount === 1 ? '' : 'en'}).
            </p>
            <div className="flex flex-wrap gap-3 justify-center">
              <button onClick={onResume} className="retro-button bg-retro-amber text-white px-8 font-bold">
                Weitermachen →
              </button>
              <button onClick={onReset} className="px-6 py-3 border-2 border-retro-ink font-semibold bg-white">
                Neu beginnen
              </button>
            </div>
          </div>
        ) : (
          <>
            <button onClick={onStart} className="retro-button bg-retro-amber text-white w-full py-4 text-xl font-bold">
              Zeitreise starten →
            </button>
            <p className="text-xs text-retro-brown text-center mt-2">Kostenfrei · Keine Vorkenntnisse nötig</p>
          </>
        )}
      </section>

      {resumeTarget && (
        <JourneyStages
          warm
          lastStage={resumeTarget}
          memoriesCount={memoriesCount}
          diaryWritten={diaryWritten}
          onOpen={onOpenStage}
        />
      )}

      <section className="rounded-2xl bg-retro-cream p-6 md:p-8">
        <h2 className="text-xl md:text-2xl mb-2">Deine Zeitreise im Überblick</h2>
        <p className="text-retro-brown mb-4">
          Tippe auf ein Jahrzehnt, um zu sehen, was dich dort erwartet.
        </p>
        <div className="flex flex-wrap gap-2 mb-4">
          {decades.map((d) => (
            <button
              key={d}
              onClick={() => setShownDecade(d)}
              aria-pressed={d === shownDecade}
              className={`px-4 h-10 rounded-full text-sm font-semibold ${
                d === shownDecade ? 'bg-retro-amber-dark text-white' : 'bg-[#eee0d6] text-retro-brown'
              }`}
            >
              {d}er{d === focusDecade && ' (deine Zeit)'}
            </button>
          ))}
        </div>
        {shown && (
          <div className="rounded-xl bg-white border border-[#e6dac8] p-4">
            <p className="font-semibold mb-1">{shown.title}</p>
            <p className="text-sm text-retro-brown">
              {shown.buzzwords.slice(0, 4).map((b) => b.term).join(', ')} und vieles mehr.
            </p>
          </div>
        )}
      </section>

      <p className="rounded-2xl bg-[#eee0d6]/60 px-4 py-3 text-sm text-center">
        Große Schrift · Einfach zu bedienen · Jederzeit pausierbar
      </p>

      {finds.length > 0 && (
        <section>
          <h2 className="text-sm uppercase tracking-wider font-semibold text-retro-brown mb-3">Archiv-Fundstücke</h2>
          <div className="flex gap-4 overflow-x-auto pb-2 -mx-4 px-4 snap-x">
            {finds.map((item) => (
              <button
                key={item.keyword}
                onClick={() => onSelectGalleryItem(item)}
                className="retro-card bg-retro-paper-white overflow-hidden text-left w-44 flex-shrink-0 snap-start"
              >
                <img src={viaProxy(item.image)} alt="" loading="lazy" className="w-full h-28 object-cover retro-photo" />
                <span className="block p-3 text-sm font-semibold leading-snug">{item.title}</span>
              </button>
            ))}
          </div>
        </section>
      )}

      <section className="retro-card bg-retro-paper-white p-6 md:p-8 text-center">
        <IntroExtras {...rest} />
      </section>
    </div>
  );
};
