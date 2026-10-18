import React, { useEffect, useRef } from 'react';
import { useMuted } from '../../lib/mute';
import { PRIVACY_URL, setConsent, useConsent, viaProxy } from '../../lib/privacy';
import { isGerman, tr } from '../../lib/i18n';

// Embedded YouTube player that starts on its own. It follows the app-wide
// mute switch: it starts muted when sound is off, and flipping the switch
// while it plays mutes or unmutes it through the iframe API.
// Nothing from YouTube loads before the visitor allows it (DSGVO): until
// then a placeholder with the proxied thumbnail asks first.
// `end` stops the video after that many seconds (the title music clip on the
// game page), `autoplay={false}` loads it paused, and `onEnded` fires once the
// video has played to its end.
interface Props {
  id: string;
  title: string;
  thumb?: string;
  end?: number;
  autoplay?: boolean;
  onEnded?: () => void;
}

export const YouTubePlayer: React.FC<Props> = (props) => {
  const allowed = useConsent('youtube') === true;
  return allowed ? <Player {...props} /> : <AskFirst thumb={props.thumb} />;
};

const AskFirst: React.FC<{ thumb?: string }> = ({ thumb }) => (
  <div className="yt-frame yt-ask" style={thumb ? { backgroundImage: `url("${viaProxy(thumb)}")` } : undefined}>
    <div className="yt-ask-box">
      <p className="pixel-font">{tr('▶ VIDEO FROM YOUTUBE', '▶ VIDEO VON YOUTUBE')}</p>
      <p>
        {tr(
          'The YouTube player only loads once you allow it. Data such as your IP address is then sent to Google, and YouTube may set cookies.',
          "Erst wenn du's erlaubst, lädt der Player von YouTube. Dabei gehen Daten wie deine IP-Adresse an Google, und YouTube kann Cookies setzen."
        )}{' '}
        <a href={PRIVACY_URL} target="_blank" rel="noreferrer">
          {tr('Privacy', 'Datenschutz')}
        </a>
      </p>
      <button className="px-btn big" onClick={() => setConsent('youtube', true)} data-nav>
        {tr('ALLOW YOUTUBE', 'YOUTUBE ERLAUBEN')}
      </button>
      <p className="dim">{tr('Applies to all videos from now on. You can take it back in the settings.', "Gilt ab jetzt für alle Videos. Zurücknehmen kannst du's in den Einstellungen.")}</p>
    </div>
  </div>
);

const Player: React.FC<Props> = ({ id, title, end, autoplay = true, onEnded }) => {
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

  // The iframe API reports the player state once we say we're listening;
  // state 0 means the video (or its `end`) is over.
  const ended = useRef(onEnded);
  ended.current = onEnded;
  useEffect(() => {
    const onMessage = (e: MessageEvent) => {
      if (e.source !== frame.current?.contentWindow || typeof e.data !== 'string') return;
      try {
        const d = JSON.parse(e.data);
        const state = d.event === 'onStateChange' ? d.info : d.event === 'infoDelivery' ? d.info?.playerState : undefined;
        if (state === 0) ended.current?.();
      } catch {
        /* not from the player */
      }
    };
    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, []);

  const src = `https://www.youtube-nocookie.com/embed/${encodeURIComponent(id)}?autoplay=${autoplay ? 1 : 0}${end ? `&end=${end}` : ''}&mute=${
    startMuted.current ? 1 : 0
  }&enablejsapi=1&rel=0&modestbranding=1&playsinline=1&hl=${isGerman ? 'de' : 'en'}&origin=${encodeURIComponent(window.location.origin)}`;

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
        onLoad={() =>
          setTimeout(() => {
            send(startMuted.current ? 'mute' : 'unMute');
            frame.current?.contentWindow?.postMessage(JSON.stringify({ event: 'listening', id: 1 }), '*');
          }, 400)
        }
      />
    </div>
  );
};
