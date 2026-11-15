"use client";

import { useEffect, useSyncExternalStore } from "react";
import { soundtrack } from "@/lib/soundtrack";
import { cn } from "@/lib/cn";

/**
 * Round button in the nav that turns the background music on and off.
 * Four bars move like a level meter while it plays and lie flat when it is off.
 * All the audio logic lives in one shared engine (lib/soundtrack), so this button can
 * appear in several places (full nav, folded nav) without anything doubling up.
 */
export function SoundToggle({ className }: { className?: string }) {
  const playing = useSyncExternalStore(soundtrack.subscribe, soundtrack.isPlaying, () => false);

  useEffect(() => {
    soundtrack.init();
  }, []);

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
