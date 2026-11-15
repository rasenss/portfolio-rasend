"use client";

import { useLenis } from "lenis/react";
import { useEffect, useRef, useState } from "react";
import { soundtrack } from "@/lib/soundtrack";
import { cn } from "@/lib/cn";

/**
 * Welcome screen with the sound choice. Browsers only allow sound after a click or tap, so
 * this one tap is what lets the music start the moment the site opens.
 *
 * It's in the page from the very first paint (a tiny script in the layout decides whether
 * to show it, so it never flashes), and the page's opening animations wait behind it, then
 * play as you enter. Visitors who chose "quietly" before don't see it again.
 */
export function SoundGate() {
  const lenis = useLenis();
  const [leaving, setLeaving] = useState(false);
  const [gone, setGone] = useState(false);
  const primary = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!document.documentElement.classList.contains("gate")) {
      setGone(true);
      return;
    }
    lenis?.stop();
    primary.current?.focus({ preventScroll: true });
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") enter(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lenis]);

  const enter = (withSound: boolean) => {
    if (leaving) return;
    soundtrack.enter(withSound);
    document.documentElement.classList.remove("gate"); // the opening animations start now
    setLeaving(true);
    lenis?.start();
    window.setTimeout(() => setGone(true), 650);
  };

  if (gone) return null;

  return (
    <div
      data-sound-gate
      role="dialog"
      aria-modal="true"
      aria-labelledby="gate-title"
      className={cn("sound-gate fixed inset-0 z-[120] items-center justify-center px-5", leaving && "is-leaving")}
    >
      <div className="gate-panel nav-glass relative w-full max-w-md rounded-[32px] p-7 text-center md:p-9">
        <span className="absolute -top-4 left-1/2 -translate-x-1/2 rounded-full bg-person px-3.5 py-1 text-[13px] font-bold text-on">soundtrack 1.00</span>

        {/* four still bars, the same mark as the music button */}
        <span aria-hidden className="mx-auto flex h-10 items-center justify-center gap-[5px]">
          {[0.45, 0.85, 0.6, 1].map((h, i) => (
            <span key={i} className="block w-[5px] rounded-full bg-role" style={{ height: `${h * 100}%` }} />
          ))}
        </span>

        <h2 id="gate-title" className="mt-5 font-condensed text-[2.6rem] font-black uppercase leading-[0.9]">
          Best with sound
        </h2>
        <p className="mx-auto mt-4 max-w-[30ch] text-[17px] leading-relaxed text-fg-soft">
          This site has its own calm soundtrack, made live in your browser. You can switch it off any time from the top bar.
        </p>

        <div className="mt-7 flex flex-col gap-2.5 sm:flex-row sm:justify-center">
          <button
            ref={primary}
            type="button"
            onClick={() => enter(true)}
            className="btn-sweep inline-flex items-center justify-center rounded-full bg-role px-6 py-3.5 text-[1rem] font-semibold text-on transition-transform duration-150 active:scale-[0.97] [--sweep:var(--color-fg)]"
          >
            Enter with sound
          </button>
          <button
            type="button"
            onClick={() => enter(false)}
            className="inline-flex items-center justify-center rounded-full border-2 border-line px-6 py-3.5 text-[1rem] font-semibold text-fg transition-colors hover:border-fg"
          >
            Enter quietly
          </button>
        </div>
      </div>
    </div>
  );
}
