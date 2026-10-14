import React, { useEffect, useRef, useState } from 'react';
import { useMuted } from '../lib/mute';
import { PRIVACY_URL, setConsent, useConsent } from '../lib/privacy';
import { isGerman, tr } from '../lib/i18n';
import { yearPhrase } from '../lib/robotVoice';

// "Welcome to the year 1975" above every stop, so you always know where the
// time machine has put you (Marco, 2026-10-14: "der entsprechende Text
// welcome to the year x sollte dastehen, damit man weiß, wo man gerade ist;
// unter dem Text sollte automatisch ein YouTube-Video abgespielt werden aus
// dieser Zeit"). After every journey (`travel` changes) the video of that
// year opens and starts on its own; it can be folded away. The video is a
// year in review found through /api/youtube. Nothing from YouTube loads
// before the visitor allows it (lib/privacy), and the player follows the
// app-wide mute switch. App.tsx pauses the Spotify music while a video is on screen.

interface Video {
  id: string;
  title: string;
}

const cache = new Map<number, Promise<Video | null>>();

function videoFor(year: number): Promise<Video | null> {
  let p = cache.get(year);
  if (!p) {
    const q = isGerman ? `Jahresrückblick ${year}` : `${year} year in review`;
    p = fetch(`/api/youtube?q=${encodeURIComponent(q)}`)
      .then((r) => (r.ok ? r.json() : { videos: [] }))
      .then((d) => {
        const v = (d.videos ?? [])[0];
        return v?.id ? { id: String(v.id), title: String(v.title ?? '') } : null;
      })
      .catch(() => null);
    p.then((v) => {
      if (!v) cache.delete(year);
    });
    cache.set(year, p);
  }
  return p;
}

const Player: React.FC<{ video: Video; onPlayingChange?: (playing: boolean) => void }> = ({ video, onPlayingChange }) => {
  const muted = useMuted();
  useEffect(() => {
    onPlayingChange?.(true);
    return () => onPlayingChange?.(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const frame = useRef<HTMLIFrameElement>(null);
  const startMuted = useRef(muted);
  const send = (func: string) =>
    frame.current?.contentWindow?.postMessage(JSON.stringify({ event: 'command', func, args: [] }), '*');
  useEffect(() => {
    send(muted ? 'mute' : 'unMute');
  }, [muted]);
  const src = `https://www.youtube-nocookie.com/embed/${encodeURIComponent(video.id)}?autoplay=1&mute=${
    startMuted.current ? 1 : 0
  }&enablejsapi=1&rel=0&modestbranding=1&playsinline=1&hl=${isGerman ? 'de' : 'en'}&origin=${encodeURIComponent(window.location.origin)}`;
  return (
    <div className="rm-year-video">
      <iframe
        ref={frame}
        key={video.id}
        src={src}
        title={video.title || 'YouTube'}
        allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
        allowFullScreen
        onLoad={() => window.setTimeout(() => send(startMuted.current ? 'mute' : 'unMute'), 400)}
      />
    </div>
  );
};

export const YearWelcome: React.FC<{
  year: number;
  /** Changes on every journey: opens and starts the video again. */
  travel: number;
  /** A video is on screen (App pauses the Spotify music meanwhile). */
  onPlayingChange?: (playing: boolean) => void;
}> = ({ year, travel, onPlayingChange }) => {
  const allowed = useConsent('youtube') === true;
  const [open, setOpen] = useState(false);
  const [video, setVideo] = useState<Video | null | undefined>(undefined);

  const change = (next: boolean) => setOpen(next);

  // Every journey opens the video of the new year.
  useEffect(() => {
    if (travel > 0) change(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [travel]);

  useEffect(() => {
    if (!allowed || !open) return;
    let live = true;
    setVideo(undefined);
    videoFor(year).then((v) => live && setVideo(v));
    return () => {
      live = false;
    };
  }, [allowed, open, year]);

  return (
    <section className="rm-year no-print" aria-live="polite">
      <div className="rm-year-head">
        <div className="min-w-0">
          <p className="rm-eyebrow">{tr('The time machine has landed', 'Die Zeitmaschine ist gelandet')}</p>
          <h2 className="rm-year-title">{yearPhrase(year)}</h2>
        </div>
        <button type="button" className="rm-btn rm-btn-secondary rm-year-toggle" onClick={() => change(!open)} aria-expanded={open}>
          {open ? tr('Hide video', 'Video ausblenden') : tr(`▶ Video from ${year}`, `▶ Video aus ${year}`)}
        </button>
      </div>
      {open &&
        (!allowed ? (
          <div className="rm-year-ask">
            <p>
              {tr(
                `A video from ${year} plays here from YouTube. It only loads once you allow it; data such as your IP address then goes to Google, and YouTube may set cookies.`,
                `Hier läuft ein Video aus ${year} von YouTube. Es lädt erst, wenn du es erlaubst; dabei gehen Daten wie deine IP-Adresse an Google, und YouTube kann Cookies setzen.`
              )}{' '}
              <a href={PRIVACY_URL} target="_blank" rel="noreferrer" className="underline">
                {tr('Privacy', 'Datenschutz')}
              </a>
            </p>
            <button type="button" className="retro-button rm-btn bg-retro-ink text-white" onClick={() => setConsent('youtube', true)}>
              {tr('Allow YouTube', 'YouTube erlauben')}
            </button>
          </div>
        ) : video ? (
          <Player video={video} onPlayingChange={onPlayingChange} />
        ) : (
          <p className="rm-year-note">
            {video === null
              ? tr(`No video from ${year} found right now.`, `Gerade kein Video aus ${year} gefunden.`)
              : tr(`Looking for a video from ${year} …`, `Suche ein Video aus ${year} …`)}
          </p>
        ))}
    </section>
  );
};
