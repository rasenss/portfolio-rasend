"use client";

import { ReactLenis } from "lenis/react";
import { useEffect } from "react";
import "lenis/dist/lenis.css";

/**
 * A reload always starts at the top, so the hero intro plays first and the hero is what the
 * browser paints first (otherwise a gallery image further down becomes the first big paint).
 * A link straight to a section (#work) still lands on that section.
 */
function StartAtTop() {
  useEffect(() => {
    if (!("scrollRestoration" in history)) return;
    history.scrollRestoration = "manual";
    if (!location.hash) window.scrollTo(0, 0);
  }, []);
  return null;
}

export function SmoothScroll({ children }: { children: React.ReactNode }) {
  return (
    <ReactLenis root options={{ autoRaf: true, lerp: 0.09, smoothWheel: true, anchors: true }}>
      <StartAtTop />
      {children}
    </ReactLenis>
  );
}
