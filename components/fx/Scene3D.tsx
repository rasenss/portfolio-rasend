"use client";

import { useEffect, useRef } from "react";

/**
 * Full-page 3D background (see lib/scene3d.ts). It sits fixed behind every section, so it
 * shows through the whole site while the content scrolls over it.
 * The 3D code loads only after the page has painted and the browser is idle, so it never
 * delays the first view; the canvas fades in once its first frame is drawn.
 */
export function Scene3D() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    // older, low-memory devices get near-solid glass (no blur) so scrolling stays smooth
    const nav = navigator as Navigator & { deviceMemory?: number };
    if ((nav.hardwareConcurrency ?? 8) <= 4 || (nav.deviceMemory ?? 8) <= 4) document.documentElement.classList.add("glass-lite");
    let handle: { stop: () => void } | null = null;
    let cancelled = false;

    const boot = () => {
      import("@/lib/scene3d")
        .then(({ start }) => {
          if (cancelled) return;
          handle = start(canvas, () => canvas.classList.add("is-on"));
        })
        .catch(() => {});
    };

    // If the graphics card resets (driver update, GPU switch, too many tabs), the browser takes
    // the 3D away and may hand it back. Rebuild once when it does; if it keeps happening, stay
    // on the plain background for the rest of the visit rather than fight the browser.
    let restores = 0;
    const onRestored = () => {
      handle?.stop();
      handle = null;
      if (++restores <= 1) boot();
    };
    canvas.addEventListener("webglcontextrestored", onRestored);

    const w = window as Window & { requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number; cancelIdleCallback?: (id: number) => void };
    const id = w.requestIdleCallback ? w.requestIdleCallback(boot, { timeout: 1500 }) : window.setTimeout(boot, 600);

    return () => {
      cancelled = true;
      canvas.removeEventListener("webglcontextrestored", onRestored);
      if (w.cancelIdleCallback) w.cancelIdleCallback(id);
      else window.clearTimeout(id);
      handle?.stop();
    };
  }, []);

  return <canvas ref={ref} aria-hidden className="scene-3d pointer-events-none fixed left-0 top-0 -z-10 h-lvh w-full" />;
}
