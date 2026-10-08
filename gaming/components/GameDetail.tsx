import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Game, LOADING_LINES, PLATFORM_COLORS } from '../data/games';
import { platformLabel } from '../data/platforms';
import { fetchImages, fetchSummary, WikiImage, WikiSummary } from '../lib/wiki';
import { AiUnavailableError, fetchGameGuide, fetchGamePress, GameGuide } from '../lib/ai';
import { chip } from '../lib/chiptune';
import { MiniMarkdown } from './MiniMarkdown';
import { YouTubePlayer } from './YouTubePlayer';
import { fetchVideos, formatViews, VideoKind, YouTubeVideo } from '../lib/youtube';
import { useConsent, viaProxy } from '../../lib/privacy';
import { LOCALE, tr } from '../../lib/i18n';

type Tab = 'info' | 'videos' | 'media' | 'shots' | 'press' | 'guide' | 'web';

const TABS: { id: Tab; label: string }[] = [
  { id: 'info', label: 'INFO' },
  { id: 'videos', label: 'VIDEOS' },
  { id: 'media', label: tr('MUSIC & TV ADS', 'MUSIK & TV-WERBUNG') },
  { id: 'shots', label: 'SCREENSHOTS' },
  { id: 'press', label: tr('MAGAZINES & TODAY', 'ZEITSCHRIFTEN & HEUTE') },
  { id: 'guide', label: 'GUIDE & CHEATS' },
  { id: 'web', label: tr('ON THE WEB', 'IM WEB') },
];

const randomLoading = () => LOADING_LINES[Math.floor(Math.random() * LOADING_LINES.length)];

const Loading: React.FC = () => {
  const line = useMemo(randomLoading, []);
  return (
    <p className="loading pixel-font" style={{ fontSize: 11 }} role="status">
      {line} <span className="blink">▮</span>
    </p>
  );
};

/** A row of YouTube clips; a tap plays one in the player at the top. */
const VideoList: React.FC<{ videos: YouTubeVideo[]; playingId?: string; onPlay: (v: YouTubeVideo) => void }> = ({ videos, playingId, onPlay }) => (
  <div className="yt-list">
    {videos.map((v) => (
      <button key={v.id} className="yt-item" aria-pressed={playingId === v.id} onClick={() => onPlay(v)} data-nav>
        <img src={viaProxy(v.thumb)} alt="" loading="lazy" />
        <span className="yt-title">{v.title}</span>
        <span className="dim yt-meta">
          {[v.channel, v.duration, formatViews(v.views), v.likes ? `${v.likes.toLocaleString(LOCALE)} 👍` : '']
            .filter(Boolean)
            .join(' · ')}
        </span>
      </button>
    ))}
  </div>
);

/** An AI answer grounded in Google Search, with its sources. */
const GroundedText: React.FC<{ title: string; result: GameGuide }> = ({ title, result }) => (
  <div className="panel">
    <h3 className="pixel-font">{title}</h3>
    <MiniMarkdown text={result.text} />
    {!!result.sources.length && (
      <div className="sources">
        <p className="dim" style={{ marginBottom: 2 }}>{tr('Sources:', 'Quellen:')}</p>
        <ul>
          {result.sources.map((src) => (
            <li key={src.uri}>
              <a href={src.uri} target="_blank" rel="noreferrer">
                {src.title}
              </a>
            </li>
          ))}
        </ul>
      </div>
    )}
    {result.searchWidget && (
      <iframe
        title={tr('Google search suggestions', 'Google-Suchvorschläge')}
        srcDoc={result.searchWidget}
        sandbox="allow-popups allow-popups-to-escape-sandbox"
        style={{ width: '100%', height: 80, border: 0, background: 'transparent' }}
      />
    )}
  </div>
);

function webLinks(game: Game, wikiUrl?: string) {
  const q = encodeURIComponent(game.title);
  return [
    wikiUrl && { href: wikiUrl, title: 'Wikipedia', text: tr('Article with history and background', 'Artikel mit Geschichte und Hintergründen') },
    { href: `https://www.youtube.com/results?search_query=${q}+longplay`, title: 'YouTube Longplay', text: tr('Watch a full playthrough', 'Komplett durchgespielt anschauen') },
    { href: `https://gamefaqs.gamespot.com/search?game=${q}`, title: 'GameFAQs', text: tr('Walkthroughs, maps and cheats from the community', 'Komplettlösungen, Karten und Cheats der Community') },
    { href: `https://www.mobygames.com/search/?q=${q}`, title: 'MobyGames', text: tr('Credits, versions, box art and screenshots', 'Credits, Versionen, Cover und Screenshots') },
    { href: `https://archive.org/search?query=${q}+manual`, title: tr('Manual (Internet Archive)', 'Handbuch (Internet Archive)'), text: tr('Scanned manuals, magazines and ads', 'Eingescannte Handbücher, Magazine und Werbung') },
    { href: `https://www.google.com/search?q=site%3Akultboy.com+${q}`, title: 'Kultboy', text: tr('Old German magazine reviews with scores', 'Alte Testberichte aus Power Play, ASM & Co. mit Wertung') },
    { href: `https://www.reddit.com/r/retrogaming/search/?q=${q}`, title: 'r/retrogaming', text: tr('Memories and discussions from other fans', 'Erinnerungen und Diskussionen anderer Fans') },
  ].filter(Boolean) as { href: string; title: string; text: string }[];
}

export const GameDetail: React.FC<{
  game: Game;
  isFavorite: boolean;
  isCompleted: boolean;
  onToggleFavorite: () => void;
  onToggleCompleted: () => void;
  onClose: () => void;
  aiAvailable: boolean;
  /** Tells the hub whether a video is playing, so the chiptune music pauses. */
  onVideoChange?: (playing: boolean) => void;
}> = ({ game, isFavorite, isCompleted, onToggleFavorite, onToggleCompleted, onClose, aiAvailable, onVideoChange }) => {
  const [tab, setTab] = useState<Tab>('info');
  const [summary, setSummary] = useState<WikiSummary | null | undefined>(undefined);
  const [images, setImages] = useState<WikiImage[] | undefined>(undefined);
  const [lightbox, setLightbox] = useState<WikiImage | null>(null);
  const [guide, setGuide] = useState<GameGuide | null>(null);
  const [guideState, setGuideState] = useState<'idle' | 'loading' | 'error' | 'unavailable'>('idle');
  const dialogRef = useRef<HTMLDivElement>(null);
  const [videos, setVideos] = useState<YouTubeVideo[] | undefined>(undefined);
  const [playing, setPlaying] = useState<YouTubeVideo | null>(null);
  const youtubeOk = useConsent('youtube') === true;
  const [media, setMedia] = useState<Partial<Record<VideoKind, YouTubeVideo[]>>>({});
  const [press, setPress] = useState<GameGuide | null>(null);
  const [pressState, setPressState] = useState<'idle' | 'loading' | 'error' | 'unavailable'>('idle');

  // Soundtrack and TV ads load once their tab is opened.
  useEffect(() => {
    setMedia({});
    setPress(null);
    setPressState('idle');
  }, [game.title]);
  useEffect(() => {
    if (tab !== 'media') return;
    let alive = true;
    for (const kind of ['soundtrack', 'commercial'] as const) {
      fetchVideos({ title: game.title, platform: String(game.platform) }, kind).then((v) => alive && setMedia((m) => ({ ...m, [kind]: v })));
    }
    return () => {
      alive = false;
    };
  }, [tab, game.title, game.platform]);

  // The best rated video starts on its own as soon as the list is there.
  useEffect(() => {
    let alive = true;
    setVideos(undefined);
    setPlaying(null);
    fetchVideos({ title: game.title, platform: String(game.platform) }).then((v) => {
      if (!alive) return;
      setVideos(v);
      setPlaying(v[0] ?? null);
    });
    return () => {
      alive = false;
    };
  }, [game.title, game.platform]);

  // Only counts as playing once YouTube is allowed and the player is there.
  const videoOn = !!playing && youtubeOk;
  useEffect(() => {
    onVideoChange?.(videoOn);
  }, [videoOn, onVideoChange]);
  useEffect(() => () => onVideoChange?.(false), [onVideoChange]);

  useEffect(() => {
    let alive = true;
    setSummary(undefined);
    setImages(undefined);
    fetchSummary(game.wiki).then((s) => alive && setSummary(s));
    fetchImages(game.wiki).then((imgs) => alive && setImages(imgs));
    return () => {
      alive = false;
    };
  }, [game.wiki]);

  // Esc closes the lightbox first, then the dialog; focus stays trapped inside
  // and returns to the card that opened the dialog afterwards.
  const latest = useRef({ lightbox, onClose });
  latest.current = { lightbox, onClose };
  useEffect(() => {
    const prev = document.activeElement as HTMLElement | null;
    dialogRef.current?.querySelector<HTMLElement>('[data-nav]')?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (latest.current.lightbox) setLightbox(null);
        else latest.current.onClose();
        return;
      }
      if (e.key !== 'Tab' || !dialogRef.current) return;
      const items = Array.from(dialogRef.current.querySelectorAll<HTMLElement>('button, a[href], input'));
      if (!items.length) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener('keydown', onKey);
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = overflow;
      prev?.focus?.();
    };
  }, []);

  const loadGuide = async () => {
    chip.play('coin');
    setGuideState('loading');
    try {
      const g = await fetchGameGuide({ title: game.title, platform: String(game.platform), year: game.year });
      setGuide(g);
      setGuideState('idle');
      chip.play('powerup');
    } catch (e) {
      setGuideState(e instanceof AiUnavailableError ? 'unavailable' : 'error');
      chip.play('error');
    }
  };

  const loadPress = async () => {
    chip.play('coin');
    setPressState('loading');
    try {
      setPress(await fetchGamePress({ title: game.title, platform: String(game.platform), year: game.year }));
      setPressState('idle');
      chip.play('powerup');
    } catch (e) {
      setPressState(e instanceof AiUnavailableError ? 'unavailable' : 'error');
      chip.play('error');
    }
  };

  const playClip = (v: YouTubeVideo) => {
    chip.play('select');
    setPlaying(v);
    dialogRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const pick = (t: Tab) => {
    chip.play('blip');
    setTab(t);
  };

  const label = PLATFORM_COLORS[game.platform] ?? 'var(--a1)';

  return (
    <div className="overlay" onClick={onClose}>
      <div
        ref={dialogRef}
        className="dialog"
        role="dialog"
        aria-modal="true"
        aria-label={game.title}
        onClick={(e) => e.stopPropagation()}
        style={{ borderColor: label }}
      >
        <button className="px-btn close-x" onClick={onClose} aria-label={tr('Close', 'Schließen')} data-nav>
          ✕
        </button>
        <h2 className="pixel-font rgb-split">{game.title}</h2>
        <p className="dim" style={{ margin: 0 }}>
          {[platformLabel(game.platform), game.year || '—', game.developer, game.genre].filter(Boolean).join(' · ')}
        </p>

        <div className="toolbar" style={{ margin: '12px 0 0' }}>
          <button className="px-btn" aria-pressed={isFavorite} onClick={onToggleFavorite} data-nav>
            {isFavorite ? tr('★ IN COLLECTION', '★ IN SAMMLUNG') : tr('☆ COLLECT', '☆ SAMMELN')}
          </button>
          <button className="px-btn" aria-pressed={isCompleted} onClick={onToggleCompleted} data-nav>
            {isCompleted ? tr('✓ BEATEN', '✓ DURCHGESPIELT') : tr('○ BEATEN IT?', '○ DURCHGESPIELT?')}
          </button>
        </div>

        {playing && <YouTubePlayer id={playing.id} title={`YouTube: ${playing.title}`} thumb={playing.thumb} />}
        {playing && (
          <p className="dim yt-caption">
            ▶ {playing.title}
            {playing.channel && ` · ${playing.channel}`}
            {playing.views > 0 && ` · ${formatViews(playing.views)}`}
            {' '}
            <button className="px-btn" onClick={() => { chip.play('back'); setPlaying(null); }} data-nav>
              {tr('■ STOP', '■ STOPP')}
            </button>
          </p>
        )}

        <div className="tabs" role="tablist">
          {TABS.map((t) => (
            <button
              key={t.id}
              role="tab"
              aria-selected={tab === t.id}
              aria-pressed={tab === t.id}
              className="px-btn"
              onClick={() => pick(t.id)}
              data-nav
            >
              {t.label}
            </button>
          ))}
        </div>

        {tab === 'info' && (
          <div className="info-layout">
            <div>
              {game.blurb && <p style={{ marginTop: 0 }}>{game.blurb}</p>}
              {summary === undefined ? (
                <Loading />
              ) : summary ? (
                <>
                  <p>{summary.extract}</p>
                  <p className="dim" style={{ fontSize: 16 }}>
                    {tr('Source:', 'Quelle:')}{' '}
                    <a href={summary.url} target="_blank" rel="noreferrer">
                      Wikipedia ({summary.lang.toUpperCase()})
                    </a>
                    , CC BY-SA 4.0
                  </p>
                </>
              ) : (
                <p className="dim">{tr('No Wikipedia article found.', 'Kein Wikipedia-Artikel gefunden.')}</p>
              )}
              {game.funFact && (
                <div className="panel">
                  <h3 className="pixel-font">{tr('DID YOU KNOW?', 'WUSSTEST DU?')}</h3>
                  {game.funFact}
                </div>
              )}
            </div>
            <div>
              {summary?.thumbnail && (
                <img
                  className="boxart"
                  src={summary.thumbnail}
                  alt={tr(`Box art: ${game.title}`, `Titelbild: ${game.title}`)}
                  onError={(e) => {
                    const small = summary.thumbnailSmall;
                    if (small && e.currentTarget.src !== new URL(small, window.location.href).href) e.currentTarget.src = small;
                  }}
                />
              )}
            </div>
          </div>
        )}

        {tab === 'videos' && (
          <div>
            {videos === undefined ? (
              <Loading />
            ) : videos.length ? (
              <>
                <VideoList videos={videos} playingId={playing?.id} onPlay={playClip} />
                <p className="dim" style={{ fontSize: 16 }}>{tr('Videos from YouTube, the most popular one plays first.', 'Videos von YouTube, das beliebteste läuft zuerst.')}</p>
              </>
            ) : (
              <p className="dim">
                {tr('No videos around. “ON THE WEB” takes you straight to a YouTube search.', 'Keine Videos am Start. Unter „IM WEB“ geht’s direkt zur YouTube-Suche.')}
              </p>
            )}
          </div>
        )}

        {tab === 'shots' && (
          <div>
            {images === undefined ? (
              <Loading />
            ) : images.length ? (
              <>
                <div className="shots">
                  {images.map((img) => (
                    <button key={img.src} className="shot" onClick={() => setLightbox(img)} data-nav>
                      <figure style={{ margin: 0 }}>
                        <img src={img.src} alt={img.caption || game.title} loading="lazy" />
                        {img.caption && <figcaption>{img.caption}</figcaption>}
                      </figure>
                    </button>
                  ))}
                </div>
                <p className="dim" style={{ fontSize: 16 }}>
                  {tr('Images from Wikipedia/Wikimedia. License and author are listed on each image page.', 'Bilder aus Wikipedia/Wikimedia. Lizenz und Urheber stehen auf der jeweiligen Bildseite.')}
                </p>
              </>
            ) : (
              <p className="dim">
                {tr('No images around. Check “ON THE WEB” for longplays and screenshot collections.', 'Keine Bilder am Start. Unter „IM WEB“ findest du Longplays und Screenshot-Sammlungen.')}
              </p>
            )}
          </div>
        )}

        {tab === 'media' && (
          <div>
            {(['soundtrack', 'commercial'] as const).map((kind) => (
              <section key={kind}>
                <h3 className="pixel-font media-head">
                  {kind === 'soundtrack' ? tr('♪ SOUNDTRACK', '♪ SOUNDTRACK') : tr('📺 TV ADS BACK THEN', '📺 TV-WERBUNG VON DAMALS')}
                </h3>
                {media[kind] === undefined ? (
                  <Loading />
                ) : media[kind]!.length ? (
                  <VideoList videos={media[kind]!.slice(0, 6)} playingId={playing?.id} onPlay={playClip} />
                ) : (
                  <p className="dim">{tr('Nothing found on YouTube.', 'Auf YouTube nichts gefunden.')}</p>
                )}
              </section>
            ))}
            <p className="dim" style={{ fontSize: 16 }}>{tr('From YouTube. A tap plays it at the top.', 'Von YouTube. Antippen spielt es oben ab.')}</p>
          </div>
        )}

        {tab === 'press' && (
          <div>
            {press ? (
              <GroundedText title={tr('MAGAZINES, TODAY, PASSWORDS', 'ZEITSCHRIFTEN, HEUTE, PASSWÖRTER')} result={press} />
            ) : pressState === 'loading' ? (
              <Loading />
            ) : (
              <div className="panel">
                <p style={{ marginTop: 0 }}>
                  {tr(
                    'What did Power Play, ASM, EGM and co. give it back then? Where can you play it legally today? And are there passwords? The Retro Guru looks it up on the web, with sources.',
                    'Was gab die Power Play, ASM, Amiga Joker oder Man!ac damals? Wo kannst du es heute legal zocken? Und gibt es Passwörter? Der Retro-Guru schaut im Web nach, mit Quellen.'
                  )}
                </p>
                <button className="px-btn big" onClick={loadPress} disabled={!aiAvailable} data-nav>
                  {tr('▶ LOOK IT UP', '▶ NACHSCHLAGEN')}
                </button>
                {(!aiAvailable || pressState === 'unavailable') && (
                  <p className="dim">{tr('The AI is AFK here right now (not set up).', 'Die KI ist hier gerade AFK (nicht eingerichtet).')}</p>
                )}
                {pressState === 'error' && <p style={{ color: 'var(--a1)' }}>{tr('GAME OVER – nothing came back. Continue?', 'GAME OVER – nichts zurückgekommen. Continue?')}</p>}
              </div>
            )}
            <div className="links" style={{ marginTop: 12 }}>
              {[
                { href: `https://archive.org/search?query=${encodeURIComponent(game.title)}+manual`, title: tr('Manual (Internet Archive)', 'Handbuch (Internet Archive)'), text: tr('Scanned manuals from back then', 'Eingescannte Handbücher von damals') },
                { href: `https://www.google.com/search?q=site%3Akultboy.com+${encodeURIComponent(game.title)}`, title: 'Kultboy', text: tr('Old German magazine reviews with scores', 'Alte Testberichte aus Power Play, ASM & Co. mit Wertung') },
              ].map((l) => (
                <a key={l.href} href={l.href} target="_blank" rel="noreferrer" data-nav>
                  <span className="pixel-font" style={{ fontSize: 10, color: 'var(--a3)' }}>
                    {l.title} ↗
                  </span>
                  <br />
                  <span className="dim">{l.text}</span>
                </a>
              ))}
            </div>
          </div>
        )}

        {tab === 'guide' && (
          <div>
            {!!game.tips?.length && (
              <div className="panel">
                <h3 className="pixel-font">{tr('TIPS FROM THE GAMING MAGAZINE', 'TIPPS AUS DER SPIELEZEITSCHRIFT')}</h3>
                <ul>
                  {game.tips.map((t) => (
                    <li key={t}>{t}</li>
                  ))}
                </ul>
              </div>
            )}
            {guide ? (
              <GroundedText title={tr('AI GUIDE (WITH WEB SEARCH)', 'KI-GUIDE (MIT WEBSUCHE)')} result={guide} />
            ) : guideState === 'loading' ? (
              <Loading />
            ) : (
              <div className="panel">
                <p style={{ marginTop: 0 }}>
                  {tr(
                    'The Retro Guru scours the web for tips, secrets and legal ways to still play this game today.',
                    'Der Retro-Guru checkt das Web nach Tipps, Secrets und legalen Wegen, das Game heute noch zu zocken.'
                  )}
                </p>
                <button className="px-btn big" onClick={loadGuide} disabled={!aiAvailable} data-nav>
                  {tr('▶ LOAD GUIDE', '▶ GUIDE LADEN')}
                </button>
                {(!aiAvailable || guideState === 'unavailable') && (
                  <p className="dim">{tr('The AI is AFK here right now (not set up).', 'Die KI ist hier gerade AFK (nicht eingerichtet).')}</p>
                )}
                {guideState === 'error' && <p style={{ color: 'var(--a1)' }}>{tr('GAME OVER – the guide didn’t load. Continue?', 'GAME OVER – der Guide hat nicht geladen. Continue?')}</p>}
              </div>
            )}
          </div>
        )}

        {tab === 'web' && (
          <div className="links">
            {webLinks(game, summary?.url).map((l) => (
              <a key={l.href} href={l.href} target="_blank" rel="noreferrer" data-nav>
                <span className="pixel-font" style={{ fontSize: 10, color: 'var(--a3)' }}>
                  {l.title} ↗
                </span>
                <br />
                <span className="dim">{l.text}</span>
              </a>
            ))}
          </div>
        )}

        {lightbox && (
          <div className="lightbox" onClick={() => setLightbox(null)} role="presentation">
            <img src={lightbox.src} alt={lightbox.caption || game.title} />
            <p style={{ maxWidth: 800, textAlign: 'center' }}>
              {lightbox.caption}{' '}
              <a href={lightbox.filePage} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()}>
                {tr('Image source & license ↗', 'Bildquelle & Lizenz ↗')}
              </a>
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
