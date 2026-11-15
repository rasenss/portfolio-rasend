"use client";

import { useLenis } from "lenis/react";
import { useEffect, useRef, useState } from "react";
import { latinQuotes, profile } from "@/content/profile";
import { gsap } from "@/lib/gsap";

const CHARS = "ABCDEFGHIKLMNOPQRSTVXYZ";
const DWELL = 5200; // ms each saying stays on screen
// the big outlined wordmark uses the first given name only, so it always fits on one line
const wordmark = profile.firstName.split(" ")[0];

/** Shuffled order with no repeats until every saying has been shown */
function makeBag(exclude: number) {
  const order = latinQuotes.map((_, i) => i).filter((i) => i !== exclude);
  for (let i = order.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [order[i], order[j]] = [order[j], order[i]];
  }
  return order;
}

/**
 * A random Roman saying that changes by itself every few seconds (a thin bar
 * counts down to the next one). Hover, focus or tap scrambles it into English
 * and pauses the rotation.
 */
function LatinQuote() {
  const text = useRef<HTMLSpanElement>(null);
  const [index, setIndex] = useState(0);
  const [english, setEnglish] = useState(false);
  const [held, setHeld] = useState(false);
  const indexRef = useRef(0);
  const bag = useRef<number[]>([]);
  const lastPointer = useRef<string>("mouse");
  const onScreen = useRef(false);

  useEffect(() => {
    const el = text.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => (onScreen.current = e.isIntersecting), { rootMargin: "200px 0px" });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const write = (value: string) => {
    const el = text.current;
    if (!el) return;
    if (!onScreen.current || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      gsap.killTweensOf(el);
      el.textContent = value;
      return;
    }
    gsap.to(el, { duration: 0.9, scrambleText: { text: value, chars: CHARS, speed: 0.5, revealDelay: 0.2 }, overwrite: true });
  };

  const goTo = (next: number) => {
    indexRef.current = next;
    setIndex(next);
    write(latinQuotes[next].latin);
  };

  const nextRandom = () => {
    if (bag.current.length === 0) bag.current = makeBag(indexRef.current);
    goTo(bag.current.shift()!);
  };

  // first random saying right after load (the server always renders the first one)
  useEffect(() => {
    nextRandom();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // rotate while nobody is reading a translation
  useEffect(() => {
    if (held) return;
    const id = setTimeout(nextRandom, DWELL);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index, held]);

  const show = (toEnglish: boolean) => {
    setHeld(toEnglish);
    setEnglish(toEnglish);
    const q = latinQuotes[indexRef.current];
    write(toEnglish ? q.english : q.latin);
  };

  const q = latinQuotes[index];

  return (
    <div className="mx-auto max-w-6xl">
      <p className="text-[15px] font-medium text-fg-soft">{english ? "In English" : "Latin. Hover or tap to translate."}</p>
      <button
        onPointerDown={(e) => (lastPointer.current = e.pointerType)}
        onPointerEnter={(e) => e.pointerType === "mouse" && show(true)}
        onPointerLeave={(e) => e.pointerType === "mouse" && show(false)}
        onFocus={() => show(true)}
        onBlur={() => show(false)}
        onClick={() => {
          // taps toggle; mouse users already get it on hover
          if (lastPointer.current !== "mouse") show(!english);
        }}
        aria-label={`${q.latin}: ${q.english}, ${q.by}`}
        className="mt-3 block min-h-[2lh] w-full text-left font-condensed text-[clamp(2.4rem,7.5vw,6.2rem)] font-black uppercase leading-[0.92] text-fg"
      >
        <span ref={text} aria-hidden>
          {latinQuotes[0].latin}
        </span>
      </button>
      <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2">
        <span className="text-[15px] font-semibold text-role">{q.by}</span>
        {/* countdown to the next saying; pauses while the translation is showing */}
        <span aria-hidden className="relative h-1 w-32 overflow-hidden rounded-full bg-line">
          <span
            key={`${index}-${held}`}
            className="quote-timer absolute inset-y-0 left-0 w-full origin-left rounded-full bg-role"
            style={{ animationDuration: `${DWELL}ms`, animationPlayState: held ? "paused" : "running" }}
          />
        </span>
        <span className="text-[13px] tabular-nums text-fg-soft">{latinQuotes.length} sayings in rotation</span>
      </div>
    </div>
  );
}

export function Footer() {
  const lenis = useLenis();

  return (
    <footer className="overflow-x-clip px-5 pb-10 pt-10 md:px-10">
      <div className="zoom-in mb-20 border-t border-line pt-14 md:mb-24">
        <LatinQuote />
      </div>

      {/* Wordmark: outline underneath, amber copy drawn in left to right as it scrolls into view */}
      <div aria-hidden className="relative mx-auto max-w-6xl select-none">
        <p className="text-outline font-condensed text-[15.6vw] font-black uppercase leading-[0.8] lg:text-[12.5rem]">{wordmark}</p>
        <p className="footer-draw absolute inset-0 font-condensed text-[15.6vw] font-black uppercase leading-[0.8] text-role lg:text-[12.5rem]">{wordmark}</p>
      </div>

      <div className="mx-auto mt-10 flex max-w-6xl flex-col gap-6 border-t border-line pt-8 text-[15px] text-fg-soft sm:flex-row sm:items-center sm:justify-between">
        <p>© 2026 {profile.name}. Built in Pacitan with Next.js.</p>
        <p className="hidden md:block">Try typing “qa”, clicking my name, or Shift-dragging anywhere.</p>
        <button
          onClick={() => (lenis ? lenis.scrollTo(0, { duration: 1.4 }) : window.scrollTo({ top: 0, behavior: "smooth" }))}
          className="btn-sweep flex w-max items-center gap-2 rounded-full border border-line bg-surface px-4 py-2 font-medium text-fg transition-colors hover:text-on"
        >
          Back to top
        </button>
      </div>
    </footer>
  );
}
