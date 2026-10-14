import React, { useEffect, useRef } from 'react';
import { playPop } from '../lib/uiSounds';

// `above` lifts the dialog over the welcome screen (SplashScreen, z-900).
export const Modal: React.FC<{ onClose: () => void; label: string; above?: boolean; children: React.ReactNode }> = ({ onClose, label, above = false, children }) => {
  const ref = useRef<HTMLDivElement>(null);
  // Parents pass a fresh onClose on every render (e.g. each time the song
  // changes). Keeping it in a ref lets the setup below run only once, so the
  // dialog doesn't jump back to its first button and scroll to the top.
  const closeRef = useRef(onClose);
  closeRef.current = onClose;

  useEffect(() => {
    const previouslyFocused = document.activeElement as HTMLElement | null;
    const node = ref.current;
    const selector = 'button, [href], input, textarea, select';
    (node?.querySelector<HTMLElement>(selector) || node)?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') return closeRef.current();
      if (e.key !== 'Tab' || !node) return;
      const items = Array.from(node.querySelectorAll<HTMLElement>(selector)).filter((el) => !el.hasAttribute('disabled'));
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
    // The window opens with a small "blop", just after the tap that opened it.
    const pop = window.setTimeout(playPop, 60);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.clearTimeout(pop);
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
      previouslyFocused?.focus?.();
    };
  }, []);

  return (
    <div className={`rm-fixed fixed inset-0 bg-black/60 ${above ? 'z-[1100]' : 'z-[650]'} flex items-center justify-center p-4 backdrop-blur-sm`} onClick={onClose}>
      <div
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-label={label}
        tabIndex={-1}
        onClick={(e) => e.stopPropagation()}
        className="rm-modal retro-card max-w-lg w-full p-6 md:p-8 bg-white relative animate-popIn max-h-[90vh] overflow-y-auto outline-none"
      >
        {children}
      </div>
    </div>
  );
};
