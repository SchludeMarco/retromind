import React, { useLayoutEffect, useRef, useState } from 'react';

// One line of text that always fits its box (Marco, 2026-10-06): first the
// font shrinks step by step down to `minSize`; if the text is still too
// long, it scrolls past as a marquee (Laufschrift) instead of being cut off.
// Styles in musicDock.css (.fit-marquee).

export const FitMarquee: React.FC<{
  text: string;
  /** Largest and smallest font size in px; equal values = never shrink. */
  maxSize: number;
  minSize?: number;
  className?: string;
}> = ({ text, maxSize, minSize = maxSize, className = '' }) => {
  const boxRef = useRef<HTMLSpanElement>(null);
  const textRef = useRef<HTMLSpanElement>(null);
  const [size, setSize] = useState(maxSize);
  const [scroll, setScroll] = useState<{ distance: number; seconds: number } | null>(null);

  useLayoutEffect(() => {
    const box = boxRef.current;
    const span = textRef.current;
    if (!box || !span) return;
    const fit = () => {
      const width = box.clientWidth;
      if (!width) return;
      let s = maxSize;
      span.style.fontSize = `${s}px`;
      while (span.scrollWidth > width && s > minSize) {
        s = Math.max(minSize, s - 1);
        span.style.fontSize = `${s}px`;
      }
      setSize(s);
      const overflow = span.scrollWidth - width;
      // ~40 px per second, plus the pauses at both ends (see the keyframes).
      setScroll(overflow > 1 ? { distance: overflow, seconds: Math.max(6, overflow / 40 / 0.7) } : null);
    };
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(box);
    return () => ro.disconnect();
  }, [text, maxSize, minSize]);

  return (
    <span ref={boxRef} className={`fit-marquee ${className}`} title={text}>
      <span
        ref={textRef}
        className={`fit-marquee-text${scroll ? ' scrolling' : ''}`}
        style={{
          fontSize: `${size}px`,
          ...(scroll
            ? ({ '--marquee-distance': `-${scroll.distance}px`, animationDuration: `${scroll.seconds}s` } as React.CSSProperties)
            : null),
        }}
      >
        {text}
      </span>
    </span>
  );
};
