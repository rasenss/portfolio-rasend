"use client";

import { useLenis } from "lenis/react";
import { AnimatePresence, MotionConfig, motion, useMotionValueEvent, useReducedMotion, useScroll, useTransform } from "motion/react";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { navLinks, profile } from "@/content/profile";
import { cn } from "@/lib/cn";
import { gsap } from "@/lib/gsap";
import { SoundToggle } from "@/components/ui/SoundToggle";

const spring = { type: "spring", stiffness: 420, damping: 38 } as const;

/** A dashed bounding box with corner handles, the same mark the site uses for "detected" things */
function HoverBox() {
  return (
    <motion.span
      layoutId="nav-hover"
      aria-hidden
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.12 } }}
      transition={spring}
      className="pointer-events-none absolute inset-0 rounded-[14px] border-[1.5px] border-dashed border-fg/70"
    >
      {["-left-[3px] -top-[3px]", "-right-[3px] -top-[3px]", "-left-[3px] -bottom-[3px]", "-right-[3px] -bottom-[3px]"].map((pos) => (
        <span key={pos} className={cn("absolute h-[7px] w-[7px] rounded-[2px] border-[1.5px] border-fg bg-base", pos)} />
      ))}
    </motion.span>
  );
}

const prefersReducedMotion = () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/** A link label that leans a few pixels toward the cursor, then springs back */
function MagneticLabel({ children, className }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const move = (e: React.PointerEvent) => {
    const el = ref.current;
    if (!el || e.pointerType !== "mouse" || prefersReducedMotion()) return;
    const r = (el.parentElement ?? el).getBoundingClientRect();
    const dx = ((e.clientX - (r.left + r.width / 2)) / r.width) * 6;
    const dy = ((e.clientY - (r.top + r.height / 2)) / r.height) * 4;
    el.style.transform = `translate(${dx.toFixed(1)}px, ${dy.toFixed(1)}px)`;
  };
  const leave = () => {
    if (ref.current) ref.current.style.transform = "";
  };
  return (
    <span onPointerMove={move} onPointerLeave={leave} className="absolute inset-0 z-[1]">
      <span ref={ref} className={cn("magnet flex h-full w-full items-center justify-center", className)}>
        {children}
      </span>
    </span>
  );
}

/** Ring that fills as you read down the page, around the number of the section you're in */
function ProgressRing({ index }: { index: number }) {
  const { scrollYProgress } = useScroll();
  return (
    <span className="relative flex h-10 w-10 shrink-0 items-center justify-center">
      <svg viewBox="0 0 40 40" className="absolute inset-0 -rotate-90" aria-hidden>
        <circle cx="20" cy="20" r="17" fill="none" strokeWidth="2.5" className="stroke-line" />
        <motion.circle cx="20" cy="20" r="17" fill="none" strokeWidth="2.5" strokeLinecap="round" className="stroke-role" style={{ pathLength: scrollYProgress }} />
      </svg>
      <span className="relative text-[13px] font-bold tabular-nums">{String(index).padStart(2, "0")}</span>
    </span>
  );
}

/**
 * The round RSN badge at the start of the bar. It rolls in with the bar, turns like a wheel as
 * you scroll down the page, and spins once more when you point at it.
 */
function BrandMark() {
  const { scrollYProgress } = useScroll();
  const reduce = useReducedMotion();
  const rotate = useTransform(scrollYProgress, [0, 1], [0, reduce ? 0 : 540]);
  return (
    <motion.span style={{ rotate }} className="relative block h-10 w-10 shrink-0 rounded-full ring-1 ring-fg/20">
      <Image src="/brand/rsn-mark.png" alt="" width={40} height={40} unoptimized loading="eager" className="rsn-mark h-full w-full rounded-full" />
    </motion.span>
  );
}

/** A link label whose letters roll up one after another on hover, revealing a fresh copy underneath */
function RollText({ text }: { text: string }) {
  return (
    <span className="roll">
      <span className="sr-only">{text}</span>
      <span aria-hidden className="flex">
        {[...text].map((c, i) => (
          <span key={i} className="roll-ch" style={{ "--i": i } as React.CSSProperties}>
            {c}
          </span>
        ))}
      </span>
    </span>
  );
}

/** A thin amber line along the bottom of the bar that fills as you read down the page */
function ReadLine() {
  const { scrollYProgress } = useScroll();
  return <motion.span aria-hidden style={{ scaleX: scrollYProgress }} className="absolute inset-x-7 bottom-0 h-[2px] origin-left rounded-full bg-role" />;
}

/** The current section's name; it decodes into place whenever the section changes */
function SectionName({ text }: { text: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      el.textContent = text;
      return;
    }
    gsap.to(el, { duration: 0.6, scrambleText: { text, chars: "ABCDEFGHIJKLMNOPQRSTUVWXYZ", speed: 0.6 }, overwrite: true });
    return () => {
      gsap.killTweensOf(el);
    };
  }, [text]);
  // the longest name sits invisibly in the same cell, so the pill keeps one width while letters decode
  const longest = ["Intro", ...navLinks.map((l) => l.label)].reduce((a, b) => (b.length > a.length ? b : a));
  return (
    <span className="grid overflow-hidden whitespace-nowrap text-left font-condensed text-lg font-black uppercase tracking-wide">
      <span aria-hidden className="invisible col-start-1 row-start-1">
        {longest}
      </span>
      <span ref={ref} className="col-start-1 row-start-1 w-0 min-w-full overflow-hidden" />
    </span>
  );
}

/**
 * Floating nav that behaves like an annotation tool's toolbar.
 * - It draws itself in as a dashed box when the page opens.
 * - Hovering a link puts a bounding box with handles around it; the box glides from link to link.
 * - Scrolling down, the bar folds into a small "tracker": a ring that fills with your reading
 *   progress, the section number, and the section name decoding into place. Scrolling up,
 *   hovering it or tapping it unfolds the full bar again.
 */
export function Nav() {
  const lenis = useLenis();
  const [active, setActive] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [down, setDown] = useState(false);
  const [peek, setPeek] = useState(false);
  const [tapped, setTapped] = useState(false);
  const [hover, setHover] = useState<string | null>(null);
  const focusBrand = useRef(false);
  const brand = useRef<HTMLAnchorElement>(null);
  const brandText = useRef<HTMLSpanElement>(null);
  const [scrolled, setScrolled] = useState(false);
  const { scrollY } = useScroll();

  // the name decodes itself when you point at it, like a label being re-read
  const scrambleBrand = () => {
    const el = brandText.current;
    if (!el || prefersReducedMotion()) return;
    gsap.to(el, { duration: 0.6, scrambleText: { text: profile.firstName, chars: "ABCDEFGHIJKLMNOPQRSTUVWXYZ", speed: 0.7 }, overwrite: true });
  };

  // Fold while reading down the page; unfold on any scroll back up
  useMotionValueEvent(scrollY, "change", (y) => {
    const prev = scrollY.getPrevious() ?? 0;
    setScrolled(y > 12);
    if (y < 320) setDown(false);
    else if (y > prev + 3) {
      setDown(true);
      setTapped(false);
    } else if (y < prev - 3) setDown(false);
  });

  useEffect(() => {
    const sections = navLinks.map((l) => document.getElementById(l.id)).filter(Boolean) as HTMLElement[];
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && setActive(e.target.id)),
      { rootMargin: "-45% 0px -50% 0px" },
    );
    sections.forEach((s) => io.observe(s));
    // back at the intro, no section is active
    const top = document.getElementById("top");
    const io2 = new IntersectionObserver(([e]) => e.isIntersecting && setActive(null), { rootMargin: "-45% 0px -50% 0px" });
    if (top) io2.observe(top);
    return () => {
      io.disconnect();
      io2.disconnect();
    };
  }, []);

  // the phone menu only exists below tablet width; widening the window closes it
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 48rem)");
    const close = () => mq.matches && setOpen(false);
    mq.addEventListener("change", close);
    return () => mq.removeEventListener("change", close);
  }, []);

  useEffect(() => {
    if (!lenis) return;
    if (open) lenis.stop();
    else lenis.start();
  }, [open, lenis]);

  const compact = down && !peek && !tapped && !open;

  // keyboard users who unfold the tracker land on the first item of the full bar
  useEffect(() => {
    if (!compact && focusBrand.current) {
      focusBrand.current = false;
      brand.current?.focus();
    }
  }, [compact]);

  const go = (id: string) => (e: React.MouseEvent) => {
    if (!lenis) return;
    e.preventDefault();
    setOpen(false);
    lenis.scrollTo(`#${id}`, { offset: -24, duration: 1.2 });
  };

  // "Email me" goes to the contact form (Gmail, email app or copy), which works for everyone,
  // even without an email app set up; the cursor lands in the message box ready to type
  const emailMe = (e: React.MouseEvent) => {
    e.preventDefault();
    setOpen(false);
    const focusMessage = () => document.getElementById("c-msg")?.focus({ preventScroll: true });
    if (lenis) lenis.scrollTo("#contact", { offset: -24, duration: 1.2, onComplete: focusMessage });
    else {
      document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" });
      window.setTimeout(focusMessage, 900);
    }
  };

  const index = active ? navLinks.findIndex((l) => l.id === active) + 1 : 0;
  const label = active ? (navLinks.find((l) => l.id === active)?.label ?? "Intro") : "Intro";

  return (
    <MotionConfig reducedMotion="user">
      <nav aria-label="Main" className="nav-in pointer-events-none fixed inset-x-0 top-4 z-50 flex justify-center px-4">
        <motion.div
          layout
          transition={spring}
          style={{ borderRadius: 999 }}
          onPointerEnter={(e) => e.pointerType === "mouse" && setPeek(true)}
          onPointerLeave={(e) => e.pointerType === "mouse" && setPeek(false)}
          className={cn("nav-glass pointer-events-auto relative flex items-center", scrolled && "is-scrolled", compact ? "w-auto" : "w-full max-w-4xl")}
        >
          {/* drawn once on load: a dashed outline traces the bar, then fades as the glass settles */}
          <span aria-hidden className="nav-trace pointer-events-none absolute -inset-px rounded-full border-[1.5px] border-dashed border-role" />
          {/* each time you enter a new section, a thin amber scan line passes across the glass */}
          <span aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden rounded-full">
            <span key={active ?? "top"} className="nav-scan absolute inset-y-0 left-0 w-[2px] bg-role" />
            {!compact && <ReadLine />}
          </span>

          <AnimatePresence mode="popLayout" initial={false}>
            {compact ? (
              <motion.div
                key="compact"
                layout="position"
                initial={{ opacity: 0, scale: 0.9, filter: "blur(4px)" }}
                animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                exit={{ opacity: 0, scale: 0.9, filter: "blur(4px)", transition: { duration: 0.15 } }}
                transition={{ duration: 0.25 }}
                className="flex items-center gap-1 py-1 pl-1 pr-1"
              >
                <button
                  type="button"
                  onClick={(e) => {
                    if (e.detail === 0) focusBrand.current = true;
                    setTapped(true);
                  }}
                  aria-label={`You're at ${label}. Show the navigation`}
                  className="flex items-center gap-2.5 rounded-full pr-3 transition-colors hover:bg-fg/5"
                >
                  <ProgressRing index={index} />
                  <SectionName text={label} />
                </button>
                <SoundToggle />
              </motion.div>
            ) : (
              <motion.div
                key="full"
                layout="position"
                initial={{ opacity: 0, filter: "blur(4px)" }}
                animate={{ opacity: 1, filter: "blur(0px)" }}
                exit={{ opacity: 0, filter: "blur(4px)", transition: { duration: 0.12 } }}
                transition={{ duration: 0.25 }}
                className="flex w-full items-center justify-between gap-2 py-1.5 pl-1.5 pr-1.5"
              >
                <a
                  ref={brand}
                  href="#top"
                  onPointerEnter={(e) => e.pointerType === "mouse" && scrambleBrand()}
                  onFocus={scrambleBrand}
                  onClick={(e) => {
                    if (!lenis) return;
                    e.preventDefault();
                    lenis.scrollTo(0, { duration: 1.2 });
                  }}
                  aria-label={profile.firstName}
                  className="nav-brand flex shrink-0 items-center gap-3 rounded-full pr-1"
                >
                  <BrandMark />
                  {/* the name sits beside the badge. On small phones it stacks on two lines so it always fits;
                      on narrow tablets the links need the room, so only the badge shows */}
                  <span className="grid max-w-[6.2em] font-condensed text-[15px] font-black uppercase leading-[1.05] tracking-wide max-[279px]:hidden min-[380px]:max-w-none min-[380px]:text-lg min-[380px]:leading-normal md:max-[859px]:hidden">
                    {/* the real name holds the size, so the bar never shifts while letters decode */}
                    <span aria-hidden className="invisible col-start-1 row-start-1 min-[380px]:whitespace-nowrap">
                      {profile.firstName}
                    </span>
                    <span ref={brandText} className="col-start-1 row-start-1 max-h-[2.1em] w-0 min-w-full overflow-hidden min-[380px]:max-h-none min-[380px]:whitespace-nowrap">
                      {profile.firstName}
                    </span>
                  </span>
                </a>

                {/* a small gap between links keeps the hover box and its handles clear of the neighbouring pill */}
                <ul className="hidden items-center gap-1 md:flex lg:gap-1.5" onPointerLeave={() => setHover(null)}>
                  {navLinks.map((l) => (
                    <li key={l.id}>
                      <a
                        href={`#${l.id}`}
                        onClick={go(l.id)}
                        onPointerEnter={() => setHover(l.id)}
                        onFocus={() => setHover(l.id)}
                        onBlur={() => setHover(null)}
                        className="nav-link relative block rounded-full px-2.5 py-2 text-[15px] font-medium transition-transform duration-150 active:scale-95 lg:px-3.5"
                      >
                        {active === l.id && (
                          <motion.span layoutId="nav-mark" className="absolute inset-0 rounded-full bg-role" transition={spring} />
                        )}
                        <AnimatePresence>{hover === l.id && active !== l.id && <HoverBox key="box" />}</AnimatePresence>
                        {/* the label is laid out once invisibly (sets the size), then shown on top so it can lean toward the cursor */}
                        <span aria-hidden className="invisible">{l.label}</span>
                        <MagneticLabel className={cn("transition-colors", active === l.id && "text-on")}>
                          <RollText text={l.label} />
                        </MagneticLabel>
                      </a>
                    </li>
                  ))}
                </ul>

                <div className="flex items-center gap-1.5">
                  <SoundToggle />
                  <a href="#contact" onClick={emailMe} className="btn-sweep hidden rounded-full bg-fg px-4 py-2 text-[15px] font-semibold text-on sm:block">
                    Email me
                  </a>
                  <button
                    onClick={() => setOpen((o) => !o)}
                    className="relative flex h-10 w-10 items-center justify-center rounded-full bg-fg/5 md:hidden"
                    aria-label={open ? "Close menu" : "Open menu"}
                    aria-expanded={open}
                  >
                    {/* plain CSS transitions: the two bars always render in place, even before JS runs */}
                    <span className={cn("absolute h-0.5 w-4 rounded-full bg-fg transition-transform duration-300", open ? "rotate-45" : "-translate-y-1")} />
                    <span className={cn("absolute h-0.5 w-4 rounded-full bg-fg transition-transform duration-300", open ? "-rotate-45" : "translate-y-1")} />
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </nav>

      <AnimatePresence>
        {open && (
          <motion.div
            // The panel is solid the instant it opens (nothing behind can show through);
            // only the links animate in, and the panel fades on close.
            initial={false}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.2 } }}
            className="fixed inset-0 z-40 flex flex-col justify-center gap-1 bg-base/97 px-6 backdrop-blur-md min-[400px]:px-8 md:hidden"
            data-lenis-prevent
          >
            {navLinks.map((l, i) => (
              <motion.a
                key={l.id}
                href={`#${l.id}`}
                onClick={go(l.id)}
                initial={{ y: 24, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.05 + i * 0.05, type: "spring", stiffness: 260, damping: 24 }}
                // sized to the screen so the longest word ("Certificates") always fits on one line
                style={{ fontSize: "clamp(2rem, calc((100vw - 4.5rem) / 6.4), 3.75rem)" }}
                className={cn("font-condensed w-max max-w-full whitespace-nowrap rounded-2xl px-2 font-black uppercase leading-none", active === l.id && "bg-role text-on")}
              >
                {l.label}
              </motion.a>
            ))}
            <a href="#contact" onClick={emailMe} className="mt-8 break-all px-2 text-lg font-medium text-fg-soft underline underline-offset-4">
              {profile.email}
            </a>
          </motion.div>
        )}
      </AnimatePresence>
    </MotionConfig>
  );
}
