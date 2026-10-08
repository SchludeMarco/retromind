import React, { useRef, useState } from 'react';
import { tr } from '../../lib/i18n';

// "Insert Coin" you can do by hand: drag the coin into the slot on the
// button (or just tap the button, as before). Gamer review, 2026-10-08.
export const CoinDrop: React.FC<{ label: React.ReactNode; onInsert: () => void }> = ({ label, onInsert }) => {
  const btn = useRef<HTMLButtonElement>(null);
  const start = useRef<{ x: number; y: number } | null>(null);
  const [offset, setOffset] = useState<{ x: number; y: number } | null>(null);
  const [dropping, setDropping] = useState(false);

  const down = (e: React.PointerEvent<HTMLSpanElement>) => {
    if (dropping) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    start.current = { x: e.clientX, y: e.clientY };
    setOffset({ x: 0, y: 0 });
  };
  const move = (e: React.PointerEvent) => {
    if (!start.current) return;
    setOffset({ x: e.clientX - start.current.x, y: e.clientY - start.current.y });
  };
  const up = (e: React.PointerEvent) => {
    if (!start.current) return;
    start.current = null;
    const r = btn.current?.getBoundingClientRect();
    const inSlot = r && e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top - 10 && e.clientY <= r.bottom + 10;
    if (!inSlot) return setOffset(null);
    setDropping(true);
    onInsert();
    setTimeout(() => {
      setDropping(false);
      setOffset(null);
    }, 350);
  };

  return (
    <div className="coin-drop">
      <span
        className={`drag-coin${offset ? ' held' : ''}${dropping ? ' dropping' : ''}`}
        style={offset ? { transform: `translate(${offset.x}px, ${offset.y}px)` } : undefined}
        onPointerDown={down}
        onPointerMove={move}
        onPointerUp={up}
        onPointerCancel={() => {
          start.current = null;
          setOffset(null);
        }}
        title={tr('Drag me into the slot', 'Zieh mich in den Schlitz')}
        aria-hidden="true"
      >
        🪙
      </span>
      <button ref={btn} className="px-btn big coin-btn" onClick={onInsert} data-nav aria-live="polite">
        <span className="coin-slit" aria-hidden="true" />
        {label}
      </button>
    </div>
  );
};
