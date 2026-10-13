import React, { useState } from 'react';
import { AppPhase, GalleryItem, GoogleUser, SpotifyUser } from '../types';
import { DECADES_DB } from '../constants';
import { useWarmChrome } from '../lib/theme';
import { viaProxy } from '../lib/privacy';
import { GoogleAuthStatus } from '../hooks/useGoogleAuth';
import { warmUpGoogle } from '../lib/googleAuth';
import { SpotifyAuthStatus } from '../hooks/useSpotifyAuth';
import { JourneyStages } from '../components/JourneyStages';
import { GamingSignpost } from '../components/GamingSignpost';
import { tr } from '../lib/i18n';
import { EraSpotlight } from '../components/EraSpotlight';
import { BookProgress } from '../components/BookProgress';
import { LivingRoom } from '../components/LivingRoom';

const SPOTIFY_PRODUCT_LABEL: Record<string, string> = {
  premium: 'Spotify Premium',
  free: 'Spotify Free',
  open: 'Spotify Free',
};

export const IntroPhase: React.FC<{
  resumeTarget: AppPhase | null;
  memoriesCount: number;
  googleStatus: GoogleAuthStatus;
  googleUser: GoogleUser | null;
  onGoogleSignIn: () => void;
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
  userName: string;
}> = (props) => (useWarmChrome() ? <WarmIntro {...props} /> : <ClassicIntro {...props} />);

type IntroProps = React.ComponentProps<typeof IntroPhase>;

const ClassicIntro: React.FC<IntroProps> = ({
  resumeTarget, memoriesCount,
  onStart, onResume, onReset, diaryWritten, onOpenStage, focusDecade, onSelectGalleryItem, userName,
  googleStatus, googleUser, onGoogleSignIn, ...rest
}) => (
  <div className="flex flex-col items-center py-6 md:py-10 text-center animate-fadeIn">
    {/* The living room comes first in every design (components/LivingRoom.tsx). */}
    <LivingRoom
      warm={false}
      userName={userName}
      resuming={!!resumeTarget}
      onStart={onStart}
      onResume={onResume}
      onOpenStage={onOpenStage}
    />
    <div className="retro-card p-8 md:p-12 max-w-2xl bg-retro-cream">
      <h2 className="text-3xl mb-6">{tr('Welcome, time traveler', 'Willkommen, Zeitreisende:r')}</h2>

      {!resumeTarget && (
        <button
          onClick={onStart}
          className="retro-button bg-retro-amber text-white px-12 py-5 text-2xl font-bold hover:bg-retro-amber-dark w-full md:w-auto mb-8"
        >
          {tr('Start the time travel', 'Zeitreise starten')}
        </button>
      )}

      {!resumeTarget && <GoogleStartLogin warm={false} status={googleStatus} user={googleUser} onSignIn={onGoogleSignIn} />}

      {!resumeTarget && (
        <EraSpotlight warm={false} userName={userName} focusDecade={focusDecade} onSelectGalleryItem={onSelectGalleryItem} />
      )}

      {resumeTarget && (
        <div className="mb-8 border-2 border-retro-amber bg-retro-highlight p-4">
          <p className="font-bold mb-3">
            {tr(
              `You have a journey in progress (${memoriesCount} memor${memoriesCount === 1 ? 'y' : 'ies'}).`,
              `Du hast eine begonnene Reise (${memoriesCount} Erinnerung${memoriesCount === 1 ? '' : 'en'}).`
            )}
          </p>
          <BookProgress warm={false} memoriesCount={memoriesCount} diaryWritten={diaryWritten} className="mb-4" />
          <div className="flex flex-wrap gap-3 justify-center">
            <button onClick={onResume} className="retro-button bg-retro-ink text-white px-6 py-3 font-bold">
              {tr('Continue', 'Weitermachen')}
            </button>
            <button onClick={onReset} className="px-6 py-3 border-2 border-retro-ink font-bold bg-white">
              {tr('Start over', 'Neu beginnen')}
            </button>
          </div>
        </div>
      )}

      {resumeTarget && <GoogleStartLogin warm={false} status={googleStatus} user={googleUser} onSignIn={onGoogleSignIn} />}

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
        {tr(
          'Open the treasure chest of your childhood. RetroMind takes you back decade by decade, asks you personal questions and gathers your answers into a memory book.',
          'Öffne die Truhe deiner Kindheit. RetroMind führt dich Jahrzehnt für Jahrzehnt zurück, stellt dir persönliche Fragen und sammelt deine Antworten zu einem Erinnerungs-Buch.'
        )}
      </p>

      <IntroExtras {...rest} />
    </div>
  </div>
);

// The optional Google sign-in, right under the start button: before, it only
// showed up at the bottom of the page (or behind the account button in Retro
// Warm). Google's script still loads only once someone reaches for the
// button (warmUpGoogle), unless they chose Google before (useGoogleAuth).
const GoogleStartLogin: React.FC<{
  warm: boolean;
  status: GoogleAuthStatus;
  user: GoogleUser | null;
  onSignIn: () => void;
}> = ({ warm, status, user, onSignIn }) => {
  if (status === 'not_configured') return null;
  const box = warm
    ? 'mt-4 rounded-2xl bg-retro-cream px-4 py-3 text-sm'
    : 'mb-8 border-2 border-retro-ink bg-white p-4 text-sm';
  if (status === 'signed_in' && user) {
    return (
      <div className={box}>
        <p className="font-bold">
          {tr(
            `☁️ Signed in as ${user.name} – your journey is backed up to your own Google Drive.`,
            `☁️ Angemeldet als ${user.name} – deine Reise wird in deinem eigenen Google Drive gesichert.`
          )}
        </p>
      </div>
    );
  }
  return (
    <div className={`${box} flex flex-col items-center gap-2 text-center`}>
      <p>
        {tr(
          '☁️ Optional: back up your journey to your own Google Drive and continue on any device.',
          '☁️ Freiwillig: Sichere deine Reise in deinem eigenen Google Drive und mach auf jedem Gerät weiter.'
        )}
      </p>
      <button
        onClick={onSignIn}
        // Google's script only loads once someone reaches for this button.
        onPointerEnter={warmUpGoogle}
        onPointerDown={warmUpGoogle}
        onFocus={warmUpGoogle}
        disabled={status === 'signing_in'}
        className={`border-2 border-retro-ink px-5 py-2 font-bold bg-white disabled:opacity-60 ${warm ? 'rounded-full' : 'retro-button'}`}
      >
        {status === 'signing_in'
          ? tr('Signing in …', 'Anmelden …')
          : status === 'error'
          ? tr('Sign in with Google again', 'Erneut mit Google anmelden')
          : tr('Sign in with Google', 'Mit Google anmelden')}
      </button>
    </div>
  );
};

const IntroExtras: React.FC<Pick<IntroProps, 'spotifyStatus' | 'spotifyUser' | 'onSpotifySignIn'>> = ({
  spotifyStatus, spotifyUser, onSpotifySignIn,
}) => (
  <>
      <GamingSignpost />

      {spotifyStatus !== 'not_configured' && (
        <div className="mb-8 border-2 border-retro-ink bg-white p-4">
          {spotifyStatus === 'signed_in' && spotifyUser ? (
            <p className="font-bold">
              🎧 {tr('Signed in as', 'Angemeldet als')} {spotifyUser.name} ({SPOTIFY_PRODUCT_LABEL[spotifyUser.product] || spotifyUser.product}).
            </p>
          ) : (
            <>
              <p className="mb-3">
                {tr(
                  <>
                    Sign in with Spotify so RetroMind knows whether you have <strong>Premium</strong>. The
                    background playlist embed works either way (see Settings) – this login is only there
                    to get to know you as a person with your own taste in music.
                  </>,
                  <>
                    Melde dich mit Spotify an, damit RetroMind weiß, ob du <strong>Premium</strong> hast. Das
                    Hintergrund-Playlist-Embed läuft unabhängig davon (siehe Einstellungen) – dieser Login ist
                    nur dafür da, dich als Person mit deinem eigenen Musikgeschmack zu kennen.
                  </>
                )}
              </p>
              <button
                onClick={onSpotifySignIn}
                disabled={spotifyStatus === 'signing_in'}
                className="retro-button border-2 border-retro-ink px-6 py-3 font-bold bg-white disabled:opacity-60"
              >
                {spotifyStatus === 'signing_in'
                  ? tr('Redirecting …', 'Weiterleitung …')
                  : spotifyStatus === 'error'
                  ? tr('Sign in with Spotify again', 'Erneut mit Spotify anmelden')
                  : tr('Sign in with Spotify', 'Mit Spotify anmelden')}
              </button>
            </>
          )}
        </div>
      )}

      <details className="mt-10 text-left text-sm text-retro-brown">
        <summary className="cursor-pointer font-bold uppercase tracking-widest text-xs">
          {tr('How RetroMind handles your data', 'Wie RetroMind mit deinen Daten umgeht')}
        </summary>
        {tr(
        <ul className="list-disc pl-5 mt-3 space-y-1">
          <li>Your profile, answers and diary stay <strong>in this browser only</strong> (localStorage).</li>
          <li>Signing in with Google is <strong>optional</strong>. If you sign in, RetroMind takes your name and age from your account, and your journey is also backed up to your <strong>own private Google Drive</strong> (the “appData” folder, only for RetroMind, visible to no one else) – so you can pick up where you left off on another device. The sign-in then applies to all RetroMind modules (e.g. RetroMind – Gaming too) until you sign out. There is no central RetroMind database; your data stays in your Google account.</li>
          <li>With a Spotify sign-in we only fetch your name and your Premium/Free status (scopes <code>user-read-private</code>, <code>user-read-email</code>) – it isn’t stored anywhere except in this browser, and there’s no separate RetroMind server for it.</li>
          <li>If you upload a photo, it is sent to the Google Gemini API to be described (and to Veo for the optional video feature). Otherwise nothing leaves your device.</li>
          <li>With “Save session” you can export everything as a file, and with “Start over” you can delete everything – including in your Drive if you’re signed in with Google.</li>
        </ul>,
        <ul className="list-disc pl-5 mt-3 space-y-1">
          <li>Profil, Antworten und Tagebuch bleiben <strong>nur in diesem Browser</strong> (localStorage).</li>
          <li>Die Anmeldung mit Google ist <strong>freiwillig</strong>. Meldest du dich an, übernimmt RetroMind Namen und Alter aus deinem Konto, und deine Reise wird zusätzlich in deinem <strong>eigenen, privaten Google-Drive</strong> gesichert (Ordner „appData", nur für RetroMind, für niemand anderen sichtbar) – so kannst du auf einem anderen Gerät weitermachen. Die Anmeldung gilt dann für alle RetroMind-Module (z.&nbsp;B. auch RetroMind – Gaming), bis du dich abmeldest. Es gibt keine zentrale RetroMind-Datenbank; deine Daten bleiben in deinem Google-Konto.</li>
          <li>Mit Spotify-Anmeldung holen wir nur deinen Namen und deinen Premium-/Free-Status ab (Scopes <code>user-read-private</code>, <code>user-read-email</code>) – wird nirgends gespeichert außer in diesem Browser, es gibt keinen eigenen RetroMind-Server dafür.</li>
          <li>Lädst du ein Foto hoch, wird es zur Beschreibung an die Google-Gemini-API gesendet (und für die optionale Video-Funktion an Veo). Sonst verlässt nichts dein Gerät.</li>
          <li>Über „Sitzung sichern" kannst du alles als Datei exportieren, über „Neu beginnen" alles löschen – bei bestehender Google-Anmeldung auch in deinem Drive.</li>
        </ul>
        )}
      </details>
  </>
);

// "Retro Warm" start page, after the Google Stitch mock-up: welcome card with
// what the journey offers, a decade overview and a strip of archive finds.
const FEATURES = [
  { icon: '✨', label: tr('6 decades, from the ’60s to today', '6 Jahrzehnte, von den 60ern bis heute') },
  { icon: '📻', label: tr('Songs, toys and TV nights from back then', 'Lieder, Spielzeug und Fernsehabende von damals') },
  { icon: '📖', label: tr('Your very own memory book to keep', 'Dein eigenes Erinnerungsbuch zum Behalten') },
];

const WarmIntro: React.FC<IntroProps> = ({
  resumeTarget, memoriesCount, onStart, onResume, onReset,
  focusDecade, onSelectGalleryItem, diaryWritten, onOpenStage, userName,
  googleStatus, googleUser, onGoogleSignIn, ...rest
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
      <section className="retro-card bg-retro-paper-white p-4 md:p-6">
        {/* The living room everyone sits down in first (components/LivingRoom.tsx). */}
        <LivingRoom
          warm
          userName={userName}
          resuming={!!resumeTarget}
          onStart={onStart}
          onResume={onResume}
          onOpenStage={onOpenStage}
        />
        <div className="px-2">
          <p className="text-lg leading-relaxed mb-5">
            {tr(
              'Grab a blanket, lean back and leaf through the decades of your childhood and youth with us. We’ll chat about the old days, find long-lost favorite things again and keep your loveliest moments in a memory book.',
              'Hol dir eine Decke, lehn dich zurück und blättere mit uns durch die Jahrzehnte deiner Kindheit und Jugend. Wir plaudern über damals, finden liebgewonnene Dinge wieder und halten deine schönsten Momente in einem Erinnerungsbuch fest.'
            )}
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
                {tr(
                  `Your journey is waiting for you, right where you left it (${memoriesCount} memor${memoriesCount === 1 ? 'y' : 'ies'}).`,
                  `Deine Reise wartet schon auf dich, genau da, wo du aufgehört hast (${memoriesCount} Erinnerung${memoriesCount === 1 ? '' : 'en'}).`
                )}
              </p>
              <BookProgress memoriesCount={memoriesCount} diaryWritten={diaryWritten} className="mb-4" />
              <div className="flex flex-wrap gap-3 justify-center">
                <button onClick={onResume} className="retro-button bg-retro-amber text-white px-8 font-bold">
                  {tr('Continue →', 'Weitermachen →')}
                </button>
                <button onClick={onReset} className="px-6 py-3 border-2 border-retro-ink font-semibold bg-white">
                  {tr('Start over', 'Neu beginnen')}
                </button>
              </div>
            </div>
          ) : (
            <>
              <button onClick={onStart} className="retro-button bg-retro-amber text-white w-full py-4 text-xl font-bold">
                {tr('Start the time travel →', 'Zeitreise starten →')}
              </button>
              <p className="text-sm text-retro-brown text-center mt-2">{tr('Free · Take all the time you like', 'Kostenlos · Ganz in Ruhe, so lange du magst')}</p>
            </>
          )}
          <GoogleStartLogin warm status={googleStatus} user={googleUser} onSignIn={onGoogleSignIn} />
        </div>
      </section>

      {!resumeTarget && (
        <EraSpotlight warm userName={userName} focusDecade={focusDecade} onSelectGalleryItem={onSelectGalleryItem} />
      )}

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
        <h2 className="text-xl md:text-2xl mb-2">{tr('Your time travel at a glance', 'Deine Zeitreise im Überblick')}</h2>
        <p className="text-retro-brown mb-4">
          {tr('Tap a decade to see what’s waiting for you there.', 'Tippe auf ein Jahrzehnt, um zu sehen, was dich dort erwartet.')}
        </p>
        {/* A steady grid instead of free-wrapping pills, so narrow phones get
            neat rows; "your era" sits as a small second line. */}
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 mb-4">
          {decades.map((d) => (
            <button
              key={d}
              onClick={() => setShownDecade(d)}
              aria-pressed={d === shownDecade}
              className={`min-h-11 px-2 py-1 rounded-2xl text-sm font-semibold leading-tight flex flex-col items-center justify-center ${
                d === shownDecade ? 'bg-retro-amber-dark text-white' : 'bg-[#eee0d6] text-retro-brown'
              }`}
            >
              {tr(`${d}s`, `${d}er`)}
              {d === focusDecade && <span className="text-xs font-normal">{tr('your era', 'deine Zeit')}</span>}
            </button>
          ))}
        </div>
        {shown && (
          <div className="rounded-xl bg-white border border-[#e6dac8] p-4">
            <p className="font-semibold mb-1">{shown.title}</p>
            <p className="text-sm text-retro-brown">
              {shown.buzzwords.slice(0, 4).map((b) => b.term).join(', ')} {tr('and much more.', 'und vieles mehr.')}
            </p>
          </div>
        )}
      </section>

      <p className="rounded-2xl bg-[#eee0d6]/60 px-4 py-3 text-sm text-center">
        {tr('Large print · Simple to use · Take a break whenever you like', 'Große Schrift · Ganz einfach · Pause machen, wann immer du magst')}
      </p>

      {finds.length > 0 && (
        <section>
          <h2 className="text-sm uppercase tracking-wider font-semibold text-retro-brown mb-3">{tr('Finds from the archive', 'Archiv-Fundstücke')}</h2>
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
