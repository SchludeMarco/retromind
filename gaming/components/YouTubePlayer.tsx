import React, { useEffect, useRef } from 'react';
import { useMuted } from '../../lib/mute';

// Embedded YouTube player that starts on its own. It follows the app-wide
// mute switch: it starts muted when sound is off, and flipping the switch
// while it plays mutes or unmutes it through the iframe API.
export const YouTubePlayer: React.FC<{ id: string; title: string }> = ({ id, title }) => {
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
