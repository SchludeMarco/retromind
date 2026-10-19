import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  FavoriteSong,
  findFavorite,
  openFavoriteCard,
  removeFavorite,
  saveFavorite,
  setFavoriteComment,
  useFavoriteCard,
  useFavoriteSongs,
} from '../lib/favoriteSongs';
import { LOCALE, tr } from '../lib/i18n';

// Saving a song you love, with words of your own if you like (Marco,
// 2026-10-19). The heart sits next to the song in the Zeitreise mini player
// and in the music panel of both apps; the saved songs are listed in the
// music panel. Data: lib/favoriteSongs.

const HEART = 'M12 21s-7.5-4.6-10-9.2C.4 8.7 2.3 4.5 6.2 4.5c2.3 0 3.8 1.3 4.8 2.8 1-1.5 2.5-2.8 4.8-2.8 3.9 0 5.8 4.2 4.2 7.3C19.5 16.4 12 21 12 21z';

export const HeartIcon: React.FC<{ filled: boolean; size?: number }> = ({ filled, size = 18 }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden="true" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={2} strokeLinejoin="round">
    <path d={HEART} />
  </svg>
);

/** The heart for the song playing now: saves it and opens the comment card. */
export const FavoriteHeart: React.FC<{
  title: string | null;
  uri: string | null;
  image: string | null;
  where: string;
  className?: string;
  size?: number;
}> = ({ title, uri, image, where, className = '', size }) => {
  useFavoriteSongs();
  const saved = findFavorite(title, uri);
  return (
    <button
      type="button"
      className={`rm-fav-heart${saved ? ' is-saved' : ''} ${className}`}
      disabled={!title}
      aria-pressed={!!saved}
      onClick={() => {
        if (!title) return;
        openFavoriteCard(saveFavorite({ title, uri, image, where }).id);
      }}
      aria-label={saved ? tr('Saved as a favorite: add a comment', 'Als Lieblingssong gemerkt: Kommentar dazu') : tr('Save this song as a favorite', 'Diesen Song als Lieblingssong merken')}
      title={saved ? tr('Saved as a favorite', 'Als Lieblingssong gemerkt') : tr('Love this song? Save it', 'Geiler Song? Merken')}
    >
      <HeartIcon filled={!!saved} size={size} />
    </button>
  );
};

/** The card after tapping a heart: optional comment, or remove again. Rendered once per app (MusicDock). */
export const FavoriteCard: React.FC = () => {
  const id = useFavoriteCard();
  const songs = useFavoriteSongs();
  const song = id ? songs.find((s) => s.id === id) ?? null : null;
  const [text, setText] = useState('');
  useEffect(() => setText(song?.comment ?? ''), [id]); // eslint-disable-line react-hooks/exhaustive-deps
  if (!song) return null;
  const close = () => {
    if (text.trim() !== song.comment) setFavoriteComment(song.id, text.trim());
    openFavoriteCard(null);
  };
  return createPortal(
    <div className="rm-fav-card-wrap no-print" onClick={close}>
      <section className="rm-fav-card" role="dialog" aria-label={tr('Favorite song', 'Lieblingssong')} onClick={(e) => e.stopPropagation()}>
        <p className="rm-fav-card-head">
          <HeartIcon filled size={16} /> {tr('Saved to your favorite songs', 'Bei deinen Lieblingssongs gemerkt')}
        </p>
        <p className="rm-fav-card-title">{song.title}</p>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          maxLength={500}
          rows={2}
          placeholder={tr('A comment, if you like: why it’s great, where you heard it first …', 'Ein Kommentar, wenn du magst: warum er so gut ist, wo du ihn zuerst gehört hast …')}
          aria-label={tr('Comment (optional)', 'Kommentar (freiwillig)')}
        />
        <div className="rm-fav-card-buttons">
          <button
            type="button"
            className="rm-fav-card-remove"
            onClick={() => {
              removeFavorite(song.id);
              openFavoriteCard(null);
            }}
          >
            {tr('Remove', 'Entfernen')}
          </button>
          <button type="button" className="rm-fav-card-done" onClick={close}>
            {tr('Done', 'Fertig')}
          </button>
        </div>
      </section>
    </div>,
    document.body
  );
};

const date = (ms: number) => new Date(ms).toLocaleDateString(LOCALE, { day: 'numeric', month: 'short', year: 'numeric' });

/** All saved songs, newest first, inside the music panel. */
export const FavoriteSongsList: React.FC<{ onPlay?: (song: FavoriteSong) => void }> = ({ onPlay }) => {
  const songs = useFavoriteSongs();
  if (!songs.length)
    return (
      <p className="music-dock-hint">
        {tr('No favorites yet. When a great song plays, tap the heart ♡ next to it.', 'Noch keine Lieblingssongs. Läuft ein geiler Song, tipp auf das Herz ♡ daneben.')}
      </p>
    );
  return (
    <ul className="rm-fav-list">
      {songs.map((s) => (
        <li key={s.id}>
          {s.image ? <img src={s.image} alt="" loading="lazy" /> : <span className="rm-fav-list-blank"><HeartIcon filled size={16} /></span>}
          <div className="rm-fav-list-text">
            <strong>{s.title}</strong>
            {s.comment && <em>{tr(`“${s.comment}”`, `„${s.comment}“`)}</em>}
            <small>
              {s.where} · {date(s.at)}
            </small>
          </div>
          {onPlay && s.uri && (
            <button type="button" onClick={() => onPlay(s)} aria-label={tr(`Play ${s.title}`, `${s.title} abspielen`)} title={tr('Play', 'Abspielen')}>
              ▶
            </button>
          )}
          <button type="button" onClick={() => openFavoriteCard(s.id)} aria-label={tr(`Comment on ${s.title}`, `Kommentar zu ${s.title}`)} title={tr('Comment or remove', 'Kommentar oder entfernen')}>
            ✎
          </button>
        </li>
      ))}
    </ul>
  );
};
