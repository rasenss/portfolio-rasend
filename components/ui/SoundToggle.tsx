"use client";

import { useEffect, useSyncExternalStore } from "react";
import { soundtrack } from "@/lib/soundtrack";
import { cn } from "@/lib/cn";

/**
 * Round button in the nav that turns the background music on and off.
 * Four bars move like a level meter while it plays and lie flat when it is off.
 */
export function SoundToggle({ className }: { className?: string }) {
  const playing = useSyncExternalStore(soundtrack.subscribe, soundtrack.isPlaying, () => false);

  useEffect(() => {
    // Someone who turned the music on last time gets it back on their first click or key press
    // (browsers never let a page start sound on its own). The toggle itself is left to its own click.
    const resume = (e: Event) => {
      const t = e.target;
      if (t instanceof Element && t.closest("[data-sound-toggle]")) return;
      soundtrack.play();
      off();
    };
    const off = () => {
      window.removeEventListener("pointerdown", resume, true);
      window.removeEventListener("keydown", resume, true);
    };
    if (soundtrack.wantsSound()) {
      window.addEventListener("pointerdown", resume, true);
      window.addEventListener("keydown", resume, true);
    }

    const onVisibility = () => soundtrack.setBackground(document.hidden);
    let frame = 0;
    const onScroll = () => {
      if (frame || !soundtrack.isPlaying()) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        const max = document.documentElement.scrollHeight - window.innerHeight;
        soundtrack.setDepth(max > 0 ? window.scrollY / max : 0);
      });
    };
    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      off();
      if (frame) cancelAnimationFrame(frame);
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  useEffect(() => {
    if (!playing) return;
    const max = document.documentElement.scrollHeight - window.innerHeight;
    soundtrack.setDepth(max > 0 ? window.scrollY / max : 0);
  }, [playing]);

  return (
    <button
      type="button"
      data-sound-toggle
      onClick={() => soundtrack.toggle()}
      aria-pressed={playing}
      aria-label={playing ? "Turn background music off" : "Turn background music on"}
      title={playing ? "Music on" : "Music off"}
      className={cn(
        "relative flex h-10 w-10 shrink-0 items-center justify-center gap-[3px] rounded-full transition-colors",
        playing ? "bg-role" : "bg-fg/5 hover:bg-fg/10",
        className,
      )}
    >
      {[0, 1, 2, 3].map((i) => (
        <span key={i} className={cn("eq-bar", playing && "is-on")} style={{ "--b": i } as React.CSSProperties} />
      ))}
    </button>
  );
}
