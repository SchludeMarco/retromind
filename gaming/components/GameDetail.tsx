import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Game, LOADING_LINES, PLATFORM_COLORS } from '../data/games';
import { fetchImages, fetchSummary, WikiImage, WikiSummary } from '../lib/wiki';
import { AiUnavailableError, fetchGameGuide, GameGuide } from '../lib/ai';
import { chip } from '../lib/chiptune';
import { MiniMarkdown } from './MiniMarkdown';
import { YouTubePlayer } from './YouTubePlayer';
import { fetchVideos, formatViews, YouTubeVideo } from '../lib/youtube';
import { useConsent, viaProxy } from '../../lib/privacy';

type Tab = 'info' | 'videos' | 'shots' | 'guide' | 'web';

const TABS: { id: Tab; label: string }[] = [
  { id: 'info', label: 'INFO' },
  { id: 'videos', label: 'VIDEOS' },
  { id: 'shots', label: 'SCREENSHOTS' },
  { id: 'guide', label: 'GUIDE & CHEATS' },
  { id: 'web', label: 'IM WEB' },
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

function webLinks(game: Game, wikiUrl?: string) {
  const q = encodeURIComponent(game.title);
  return [
    wikiUrl && { href: wikiUrl, title: 'Wikipedia', text: 'Artikel mit Geschichte und Hintergründen' },
    { href: `https://www.youtube.com/results?search_query=${q}+longplay`, title: 'YouTube Longplay', text: 'Komplett durchgespielt anschauen' },
    { href: `https://gamefaqs.gamespot.com/search?game=${q}`, title: 'GameFAQs', text: 'Komplettlösungen, Karten und Cheats der Community' },
    { href: `https://www.mobygames.com/search/?q=${q}`, title: 'MobyGames', text: 'Credits, Versionen, Cover und Screenshots' },
    { href: `https://archive.org/search?query=${q}`, title: 'Internet Archive', text: 'Alte Handbücher, Magazine und Werbung' },
    { href: `https://www.reddit.com/r/retrogaming/search/?q=${q}`, title: 'r/retrogaming', text: 'Erinnerungen und Diskussionen anderer Fans' },
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
        <button className="px-btn close-x" onClick={onClose} aria-label="Schließen" data-nav>
          ✕
        </button>
        <h2 className="pixel-font rgb-split">{game.title}</h2>
        <p className="dim" style={{ margin: 0 }}>
          {[game.platform, game.year || '—', game.developer, game.genre].filter(Boolean).join(' · ')}
        </p>

        <div className="toolbar" style={{ margin: '12px 0 0' }}>
          <button className="px-btn" aria-pressed={isFavorite} onClick={onToggleFavorite} data-nav>
            {isFavorite ? '★ IN SAMMLUNG' : '☆ SAMMELN'}
          </button>
          <button className="px-btn" aria-pressed={isCompleted} onClick={onToggleCompleted} data-nav>
            {isCompleted ? '✓ DURCHGESPIELT' : '○ DURCHGESPIELT?'}
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
              ■ STOPP
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
                    Quelle:{' '}
                    <a href={summary.url} target="_blank" rel="noreferrer">
                      Wikipedia ({summary.lang.toUpperCase()})
                    </a>
                    , CC BY-SA 4.0
                  </p>
                </>
              ) : (
                <p className="dim">Kein Wikipedia-Artikel gefunden.</p>
              )}
              {game.funFact && (
                <div className="panel">
                  <h3 className="pixel-font">WUSSTEST DU?</h3>
                  {game.funFact}
                </div>
              )}
            </div>
            <div>
              {summary?.thumbnail && (
                <img
                  className="boxart"
                  src={summary.thumbnail}
                  alt={`Titelbild: ${game.title}`}
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
                <div className="yt-list">
                  {videos.map((v) => (
                    <button
                      key={v.id}
                      className="yt-item"
                      aria-pressed={playing?.id === v.id}
                      onClick={() => {
                        chip.play('select');
                        setPlaying(v);
                        dialogRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      data-nav
                    >
                      <img src={viaProxy(v.thumb)} alt="" loading="lazy" />
                      <span className="yt-title">{v.title}</span>
                      <span className="dim yt-meta">
                        {[v.channel, v.duration, formatViews(v.views), v.likes ? `${v.likes.toLocaleString('de-DE')} 👍` : '']
                          .filter(Boolean)
                          .join(' · ')}
                      </span>
                    </button>
                  ))}
                </div>
                <p className="dim" style={{ fontSize: 16 }}>Videos von YouTube, das beliebteste läuft zuerst.</p>
              </>
            ) : (
              <p className="dim">
                Keine Videos am Start. Unter „IM WEB“ geht’s direkt zur YouTube-Suche.
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
                  Bilder aus Wikipedia/Wikimedia. Lizenz und Urheber stehen auf der jeweiligen Bildseite.
                </p>
              </>
            ) : (
              <p className="dim">
                Keine Bilder am Start. Unter „IM WEB“ findest du Longplays und Screenshot-Sammlungen.
              </p>
            )}
          </div>
        )}

        {tab === 'guide' && (
          <div>
            {!!game.tips?.length && (
              <div className="panel">
                <h3 className="pixel-font">TIPPS AUS DER SPIELEZEITSCHRIFT</h3>
                <ul>
                  {game.tips.map((t) => (
                    <li key={t}>{t}</li>
                  ))}
                </ul>
              </div>
            )}
            {guide ? (
              <div className="panel">
                <h3 className="pixel-font">KI-GUIDE (MIT WEBSUCHE)</h3>
                <MiniMarkdown text={guide.text} />
                {!!guide.sources.length && (
                  <div className="sources">
                    <p className="dim" style={{ marginBottom: 2 }}>Quellen:</p>
                    <ul>
                      {guide.sources.map((s) => (
                        <li key={s.uri}>
                          <a href={s.uri} target="_blank" rel="noreferrer">
                            {s.title}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {guide.searchWidget && (
                  <iframe
                    title="Google-Suchvorschläge"
                    srcDoc={guide.searchWidget}
                    sandbox="allow-popups allow-popups-to-escape-sandbox"
                    style={{ width: '100%', height: 80, border: 0, background: 'transparent' }}
                  />
                )}
              </div>
            ) : guideState === 'loading' ? (
              <Loading />
            ) : (
              <div className="panel">
                <p style={{ marginTop: 0 }}>
                  Der Retro-Guru checkt das Web nach Tipps, Secrets und legalen Wegen, das Game heute noch zu
                  zocken.
                </p>
                <button className="px-btn big" onClick={loadGuide} disabled={!aiAvailable} data-nav>
                  ▶ GUIDE LADEN
                </button>
                {(!aiAvailable || guideState === 'unavailable') && (
                  <p className="dim">Die KI ist hier gerade AFK (nicht eingerichtet).</p>
                )}
                {guideState === 'error' && <p style={{ color: 'var(--a1)' }}>GAME OVER – der Guide hat nicht geladen. Continue?</p>}
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
                Bildquelle & Lizenz ↗
              </a>
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
