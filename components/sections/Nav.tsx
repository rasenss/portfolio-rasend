"use client";

import { useLenis } from "lenis/react";
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from "motion/react";
import { useEffect, useState } from "react";
import { navLinks, profile } from "@/content/profile";
import { cn } from "@/lib/cn";
import { SoundToggle } from "@/components/ui/SoundToggle";

export function Nav() {
  const lenis = useLenis();
  const [active, setActive] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [hidden, setHidden] = useState(false);
  const { scrollY } = useScroll();

  // Slide the bar away while scrolling down, bring it back on any scroll up
  useMotionValueEvent(scrollY, "change", (y) => {
    const prev = scrollY.getPrevious() ?? 0;
    setHidden(y > 320 && y > prev + 2);
  });

  useEffect(() => {
    const sections = navLinks.map((l) => document.getElementById(l.id)).filter(Boolean) as HTMLElement[];
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && setActive(e.target.id)),
      { rootMargin: "-45% 0px -50% 0px" },
    );
    sections.forEach((s) => io.observe(s));
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (!lenis) return;
    if (open) lenis.stop();
    else lenis.start();
  }, [open, lenis]);

  const go = (id: string) => (e: React.MouseEvent) => {
    if (!lenis) return;
    e.preventDefault();
    setOpen(false);
    lenis.scrollTo(`#${id}`, { offset: -24, duration: 1.2 });
  };

  return (
    <>
      <motion.nav
        aria-label="Main"
        animate={{ y: hidden && !open ? -96 : 0 }}
        transition={{ type: "spring", stiffness: 380, damping: 36 }}
        className="fixed inset-x-0 top-4 z-50 flex justify-center px-4"
      >
        <div className="glass flex w-full max-w-4xl items-center justify-between gap-2 rounded-full py-1.5 pl-5 pr-1.5">
          <a
            href="#top"
            onClick={(e) => {
              if (!lenis) return;
              e.preventDefault();
              lenis.scrollTo(0, { duration: 1.2 });
            }}
            className="font-condensed text-lg font-black uppercase tracking-wide"
          >
            {profile.firstName}
          </a>

          <ul className="hidden items-center lg:flex">
            {navLinks.map((l) => (
              <li key={l.id}>
                <a href={`#${l.id}`} onClick={go(l.id)} className="relative block rounded-full px-3.5 py-2 text-[15px] font-medium">
                  {active === l.id && (
                    <motion.span layoutId="nav-mark" className="absolute inset-0 rounded-full bg-role" transition={{ type: "spring", stiffness: 420, damping: 34 }} />
                  )}
                  <span className={cn("relative transition-colors", active === l.id && "text-on")}>{l.label}</span>
                </a>
              </li>
            ))}
          </ul>

          <div className="flex items-center gap-1.5">
            <SoundToggle />
            <a href={`mailto:${profile.email}`} className="btn-sweep hidden rounded-full bg-fg px-4 py-2 text-[15px] font-semibold text-on sm:block">
              Email me
            </a>
            <button
              onClick={() => setOpen((o) => !o)}
              className="relative flex h-10 w-10 items-center justify-center rounded-full bg-fg/5 lg:hidden"
              aria-label={open ? "Close menu" : "Open menu"}
              aria-expanded={open}
            >
              {/* plain CSS transitions: the two bars always render in place, even before JS runs */}
              <span className={cn("absolute h-0.5 w-4 rounded-full bg-fg transition-transform duration-300", open ? "rotate-45" : "-translate-y-1")} />
              <span className={cn("absolute h-0.5 w-4 rounded-full bg-fg transition-transform duration-300", open ? "-rotate-45" : "translate-y-1")} />
            </button>
          </div>
        </div>
      </motion.nav>

      <AnimatePresence>
        {open && (
          <motion.div
            // The panel is solid the instant it opens (nothing behind can show through);
            // only the links animate in, and the panel fades on close.
            initial={false}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.2 } }}
            className="fixed inset-0 z-40 flex flex-col justify-center gap-1 bg-base/97 px-8 backdrop-blur-md lg:hidden"
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
                className={cn("font-condensed w-max rounded-2xl px-2 text-6xl font-black uppercase", active === l.id && "bg-role text-on")}
              >
                {l.label}
              </motion.a>
            ))}
            <a href={`mailto:${profile.email}`} className="mt-8 px-2 text-lg font-medium text-fg-soft underline underline-offset-4">
              {profile.email}
            </a>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
