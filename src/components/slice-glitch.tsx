"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

// Horizontal-slice glitch for a photo. The wrapped image stays in the DOM untouched; while a glitch
// runs, an overlay of N clipped strips of the same picture is shifted sideways with a decaying,
// partly random envelope. Strips exist only during the effect, so idle cost is zero.
// `trigger` replays it whenever its value changes; `onHover` also plays it on pointer enter.

type Props = {
  src: string;
  position?: string;
  rows?: number;
  duration?: number;
  amplitude?: number;
  trigger?: string | number;
  onHover?: boolean;
  children: ReactNode;
};

export function SliceGlitch({ src, position = "50% 50%", rows = 16, duration = 0.65, amplitude = 5, trigger, onHover = false, children }: Props) {
  const [running, setRunning] = useState(false);
  const strips = useRef<(HTMLDivElement | null)[]>([]);
  const frame = useRef(0);
  const first = useRef(true);

  const start = () => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    setRunning(true);
  };

  useEffect(() => {
    // Skip the initial mount: the effect is a reaction to a change, not to the first render.
    if (first.current) { first.current = false; return; }
    start();
  }, [trigger]);

  useEffect(() => {
    if (!running) return;
    const began = performance.now();
    const tick = (now: number) => {
      const t = (now - began) / (duration * 1000);
      if (t >= 1) { setRunning(false); return; }
      const envelope = (1 - t) ** 2;
      strips.current.forEach((strip, index) => {
        if (!strip) return;
        const active = Math.random() > 0.45;
        const wave = Math.sin(index * 1.7 + now / 38);
        const shift = active ? wave * amplitude * envelope * (0.4 + Math.random()) : 0;
        strip.style.transform = `translate3d(${shift.toFixed(2)}%, 0, 0)`;
      });
      frame.current = requestAnimationFrame(tick);
    };
    frame.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame.current);
  }, [running, duration, amplitude]);

  return (
    <div className="glitch-host" onPointerEnter={onHover ? start : undefined}>
      {children}
      {running && <div className="glitch-strips" aria-hidden="true">
        {Array.from({ length: rows }, (_, index) => (
          <div
            key={index}
            ref={(node) => { strips.current[index] = node; }}
            className="glitch-strip"
            style={{
              clipPath: `inset(${(index / rows) * 100}% 0 ${100 - ((index + 1) / rows) * 100}% 0)`,
              backgroundImage: `url("${src}")`,
              backgroundPosition: position,
            }}
          />
        ))}
      </div>}
    </div>
  );
}
