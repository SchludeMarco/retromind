import React from 'react';
import { LikeId, Likes } from '../lib/likes';
import { tr } from '../../lib/i18n';

/** The like heart with everyone's count: small in lists, `big` with the word LIKE. */
export const LikeButton: React.FC<{ id: LikeId; name: string; likes: Likes; onToggle: (id: LikeId) => void; big?: boolean; className?: string }> = ({
  id,
  name,
  likes,
  onToggle,
  big,
  className,
}) => {
  const liked = likes.mine.has(id);
  const count = likes.counts[id] ?? 0;
  return (
    <button
      type="button"
      className={`hof-like${liked ? ' liked' : ''}${big ? ' big' : ''}${className ? ` ${className}` : ''}`}
      onClick={(e) => {
        e.stopPropagation();
        onToggle(id);
      }}
      aria-pressed={liked}
      aria-label={liked ? tr(`Unlike ${name} (${count} likes)`, `${name} nicht mehr liken (${count} Likes)`) : tr(`Like ${name} (${count} likes)`, `${name} liken (${count} Likes)`)}
      data-nav
    >
      <span className="hof-like-heart" aria-hidden="true">
        {liked ? '♥' : '♡'}
      </span>
      {big && <span className="pixel-font hof-like-word">{liked ? tr('LIKED', 'GELIKT') : tr('LIKE', 'LIKEN')}</span>}
      {(big || count > 0) && <span className="pixel-font hof-like-count">{count}</span>}
    </button>
  );
};
