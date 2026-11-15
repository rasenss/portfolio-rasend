"use client";

import gsap from "gsap";
import { ScrambleTextPlugin } from "gsap/ScrambleTextPlugin";

// Only what the site actually uses: core tweens (hero name) and ScrambleText (quotes,
// confidence score). Leaving the other plugins out keeps every page load lighter.
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrambleTextPlugin);
}

export { gsap };
