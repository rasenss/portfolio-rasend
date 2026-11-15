"use client";

import { AnimatePresence, motion, useMotionValue, useSpring } from "motion/react";
import Image from "next/image";
import { useEffect, useState } from "react";
import { certifications, type Certification } from "@/content/profile";
import { cn } from "@/lib/cn";
import { Lightbox } from "@/components/ui/Lightbox";
import { SectionHeading } from "@/components/ui/Pill";

const CERT_RATIO = 1200 / 849;
const PREVIEW_W = 280;

/**
 * Certificates as a plain list, newest first. On desktop, hovering a row
 * floats a preview of the certificate beside the cursor; clicking opens it.
 */
export function Certifications() {
  const [hovered, setHovered] = useState<Certification | null>(null);
  const [open, setOpen] = useState<Certification | null>(null);
  const [showAll, setShowAll] = useState(false);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 380, damping: 32, mass: 0.4 });
  const sy = useSpring(y, { stiffness: 380, damping: 32, mass: 0.4 });

  // Hide the preview whenever the page scrolls; it comes back on the next mouse move over a row
  useEffect(() => {
    if (!hovered) return;
    const hide = () => setHovered(null);
    window.addEventListener("scroll", hide, { passive: true, once: true });
    return () => window.removeEventListener("scroll", hide);
  }, [hovered]);

  const list = showAll ? certifications : certifications.slice(0, 8);
  const issuers = new Set(certifications.map((c) => c.issuer)).size;

  // Place the preview beside the cursor, flipping to the left near the right edge
  const place = (e: React.PointerEvent, jump = false) => {
    const h = PREVIEW_W / CERT_RATIO;
    const left = e.clientX + 24 + PREVIEW_W > window.innerWidth ? e.clientX - PREVIEW_W - 24 : e.clientX + 24;
    const top = Math.min(Math.max(12, e.clientY - h / 2), window.innerHeight - h - 12);
    x.set(left);
    y.set(top);
    if (jump) {
      // jump straight there on first appearance so it never slides in from a corner
      sx.jump(left);
      sy.jump(top);
    }
  };

  const onMove = (e: React.PointerEvent) => {
    if (e.pointerType !== "mouse") return;
    place(e);
    // re-show after a scroll hid it
    if (!hovered) {
      const row = (e.target as HTMLElement).closest<HTMLElement>("[data-cert]");
      const found = row ? certifications.find((c) => c.title === row.dataset.cert) : undefined;
      if (found) {
        place(e, true);
        setHovered(found);
      }
    }
  };

  return (
    <section id="certificates" className="relative px-5 py-24 md:px-10 md:py-36">
      <div className="scene mx-auto max-w-6xl">
        <SectionHeading title="Certificates">
          {certifications.length} certificates from {issuers} organisations. Open one to see it, or verify it with the issuer.
        </SectionHeading>

        <ul className="mt-12 border-t border-line" onPointerMove={onMove} onPointerLeave={() => setHovered(null)}>
          {list.map((c) => (
            <li key={c.title} className="zoom border-b border-line">
              <button
                data-cert={c.title}
                onClick={() => setOpen(c)}
                onPointerEnter={(e) => {
                  if (e.pointerType !== "mouse") return;
                  place(e, hovered === null);
                  setHovered(c);
                }}
                className="group grid w-full grid-cols-[3.25rem_minmax(0,1fr)] items-baseline gap-x-4 gap-y-1 py-5 text-left md:grid-cols-[4rem_minmax(0,1fr)_14rem] md:gap-x-8"
              >
                <span className="text-[15px] font-medium tabular-nums text-fg-soft">{c.year}</span>
                <span className={cn("text-lg font-bold leading-snug transition-colors md:text-xl", hovered === c && "underline decoration-role decoration-[3px] underline-offset-4")}>{c.title}</span>
                <span className="col-start-2 text-[15px] text-fg-soft md:col-start-3 md:text-right">{c.issuer}</span>
              </button>
            </li>
          ))}
        </ul>

        {certifications.length > 8 && (
          <button
            onClick={() => setShowAll((s) => !s)}
            className="mt-6 rounded-full border border-line bg-surface px-5 py-3 text-[15px] font-semibold hover:border-fg"
          >
            {showAll ? "Show fewer" : `Show all ${certifications.length}`}
          </button>
        )}
      </div>

      {/* cursor preview (desktop only) */}
      <AnimatePresence>
        {hovered && !open && (
          <motion.div
            aria-hidden
            key="preview"
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.92 }}
            transition={{ duration: 0.15 }}
            style={{ x: sx, y: sy, width: PREVIEW_W }}
            className="pointer-events-none fixed left-0 top-0 z-[60] hidden overflow-hidden rounded-[18px] border-2 border-fg bg-surface md:block"
          >
            <div className="relative" style={{ aspectRatio: CERT_RATIO }}>
              <Image src={hovered.image} alt="" fill sizes="280px" className="object-contain" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {open && (
          <Lightbox image={open.image} alt={`${open.title} certificate`} ratio={CERT_RATIO} title={open.title} meta={`${open.issuer}, ${open.year}`} onClose={() => setOpen(null)}>
            <div className="flex flex-wrap gap-2">
              {open.covers.map((t) => (
                <span key={t} className="rounded-full border border-line px-3 py-1 text-[15px]">
                  {t}
                </span>
              ))}
            </div>
            {open.verify && (
              <a
                href={open.verify}
                target="_blank"
                rel="noreferrer"
                className="mt-2 inline-flex w-max items-center gap-2 rounded-full bg-fg px-5 py-3 font-semibold text-surface hover:bg-fg/85"
              >
                Verify with {open.issuer}
              </a>
            )}
          </Lightbox>
        )}
      </AnimatePresence>
    </section>
  );
}
