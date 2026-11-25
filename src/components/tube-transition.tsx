"use client";

import { useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { gsap } from "gsap";

// Page change as a "screen powering off, then on": two shutters close toward the centre,
// a bright line collapses to a point, the route changes behind the dark, and it all plays back.
// Internal link clicks are intercepted at the document level, so every <Link> and <a> gets it
// without changing call sites. It never runs with reduced motion, for modified clicks,
// new-tab links, same-path links (hash/query only) or when another transition is in flight.

const CLOSE = 0.26;
const BEAM = 0.16;
const OPEN = 0.34;
const FAILSAFE_MS = 4000;

export function TubeTransition() {
  const router = useRouter();
  const pathname = usePathname();
  const veil = useRef<HTMLDivElement>(null);
  const top = useRef<HTMLDivElement>(null);
  const bottom = useRef<HTMLDivElement>(null);
  const beam = useRef<HTMLDivElement>(null);
  const pending = useRef(false);
  const timeline = useRef<gsap.core.Timeline | null>(null);
  const failsafe = useRef<number | null>(null);
  const arrive = useRef<() => void>(() => {});

  useEffect(() => {
    const root = veil.current;
    const shutters = [top.current, bottom.current];
    const line = beam.current;
    if (!root || !line || shutters.some((item) => !item)) return;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

    const setOpen = (open: boolean) => {
      if (open) root.setAttribute("data-open", "");
      else root.removeAttribute("data-open");
      try {
        if (open && !root.matches(":popover-open")) root.showPopover();
        if (!open && root.matches(":popover-open")) root.hidePopover();
      } catch { /* No Popover API: the fixed-position fallback in CSS is enough. */ }
    };
    const clearFailsafe = () => {
      if (failsafe.current !== null) window.clearTimeout(failsafe.current);
      failsafe.current = null;
    };

    const playOn = () => {
      if (!pending.current) return;
      pending.current = false;
      clearFailsafe();
      timeline.current?.kill();
      timeline.current = gsap.timeline({ onComplete: () => setOpen(false) })
        .set(shutters, { scaleY: 1 })
        .set(line, { opacity: 1, scaleX: 0 })
        .to(line, { scaleX: 1, duration: BEAM, ease: "power2.out" })
        .to(line, { opacity: 0, duration: OPEN * 0.6, ease: "power1.out" }, `>-0.02`)
        .to(shutters, { scaleY: 0, duration: OPEN, ease: "power3.out" }, "<");
    };
    arrive.current = playOn;

    const playOff = (href: string) => {
      pending.current = true;
      setOpen(true);
      timeline.current?.kill();
      timeline.current = gsap.timeline({ onComplete: () => router.push(href) })
        .set(shutters, { scaleY: 0 })
        .set(line, { opacity: 0, scaleX: 1 })
        .to(shutters, { scaleY: 1, duration: CLOSE, ease: "power2.in" })
        .set(line, { opacity: 1 })
        .to(line, { scaleX: 0, duration: BEAM, ease: "power2.in" });
      // If the route never reports a new pathname (error, same destination), do not stay black.
      failsafe.current = window.setTimeout(playOn, FAILSAFE_MS);
    };

    const onClick = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const anchor = (event.target as Element | null)?.closest?.("a[href]") as HTMLAnchorElement | null;
      if (!anchor || anchor.hasAttribute("download")) return;
      if (anchor.target && anchor.target !== "_self") return;
      let url: URL;
      try { url = new URL(anchor.href, window.location.href); } catch { return; }
      if (url.origin !== window.location.origin || url.pathname === window.location.pathname) return;
      if (reduceMotion.matches) return;
      event.preventDefault();
      if (pending.current) return;
      playOff(url.pathname + url.search + url.hash);
    };

    document.addEventListener("click", onClick, true);
    return () => {
      document.removeEventListener("click", onClick, true);
      clearFailsafe();
      timeline.current?.kill();
      arrive.current = () => {};
      pending.current = false;
      setOpen(false);
    };
  }, [router]);

  // The new route is mounted: give it a beat to paint, then power the screen back on.
  useEffect(() => {
    if (!pending.current) return;
    const id = window.setTimeout(() => arrive.current(), 90);
    return () => window.clearTimeout(id);
  }, [pathname]);

  return (
    <div ref={veil} className="tube-veil" popover="manual" aria-hidden="true">
      <div ref={top} className="tube-shutter tube-shutter-top" />
      <div ref={bottom} className="tube-shutter tube-shutter-bottom" />
      <div ref={beam} className="tube-beam" />
    </div>
  );
}
