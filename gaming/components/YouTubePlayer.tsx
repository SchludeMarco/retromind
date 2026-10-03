import React, { useEffect, useRef } from 'react';
import { useMuted } from '../../lib/mute';
import { PRIVACY_URL, setConsent, useConsent, viaProxy } from '../../lib/privacy';

// Embedded YouTube player that starts on its own. It follows the app-wide
// mute switch: it starts muted when sound is off, and flipping the switch
// while it plays mutes or unmutes it through the iframe API.
// Nothing from YouTube loads before the visitor allows it (DSGVO): until
// then a placeholder with the proxied thumbnail asks first.
export const YouTubePlayer: React.FC<{ id: string; title: string; thumb?: string }> = (props) => {
  const allowed = useConsent('youtube') === true;
  return allowed ? <Player {...props} /> : <AskFirst thumb={props.thumb} />;
};

const AskFirst: React.FC<{ thumb?: string }> = ({ thumb }) => (
  <div className="yt-frame yt-ask" style={thumb ? { backgroundImage: `url("${viaProxy(thumb)}")` } : undefined}>
    <div className="yt-ask-box">
      <p className="pixel-font">▶ VIDEO VON YOUTUBE</p>
      <p>
        Erst wenn du's erlaubst, lädt der Player von YouTube. Dabei gehen Daten wie deine IP-Adresse an Google, und
        YouTube kann Cookies setzen.{' '}
        <a href={PRIVACY_URL} target="_blank" rel="noreferrer">
          Datenschutz
        </a>
      </p>
      <button className="px-btn big" onClick={() => setConsent('youtube', true)} data-nav>
        YOUTUBE ERLAUBEN
      </button>
      <p className="dim">Gilt ab jetzt für alle Videos. Zurücknehmen kannst du's in den Einstellungen.</p>
    </div>
  </div>
);

const Player: React.FC<{ id: string; title: string }> = ({ id, title }) => {
  const muted = useMuted();
  const frame = useRef<HTMLIFrameElement>(null);
  // The start value only matters for the first load of each video.
  const startMuted = useRef(muted);
  startMuted.current = muted;

  const send = (func: string) =>
    frame.current?.contentWindow?.postMessage(JSON.stringify({ event: 'command', func, args: [] }), '*');

  useEffect(() => {
    send(muted ? 'mute' : 'unMute');
  }, [muted]);

  const src = `https://www.youtube-nocookie.com/embed/${encodeURIComponent(id)}?autoplay=1&mute=${
    startMuted.current ? 1 : 0
  }&enablejsapi=1&rel=0&modestbranding=1&playsinline=1&hl=de&origin=${encodeURIComponent(window.location.origin)}`;

  return (
    <div className="yt-frame">
      <iframe
        ref={frame}
        key={id}
        src={src}
        title={title}
        allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
        allowFullScreen
        // the player only sets itself up after load; repeat the mute state then
        onLoad={() => setTimeout(() => send(startMuted.current ? 'mute' : 'unMute'), 400)}
      />
    </div>
  );
};
