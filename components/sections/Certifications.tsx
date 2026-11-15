"use client";

import { AnimatePresence, motion, useMotionValue, useSpring } from "motion/react";
import Image from "next/image";
import { useEffect, useState } from "react";
import type { Certification } from "@/lib/content-types";
import { cn } from "@/lib/cn";
import { Lightbox } from "@/components/ui/Lightbox";
import { PdfThumb } from "@/components/ui/PdfThumb";
import { pdfPreview } from "@/lib/pdf-preview";
import { SectionHeading } from "@/components/ui/Pill";

const PREVIEW_W = 280;

/** Stand-in picture for a certificate that only exists as a PDF: a sheet with its details */
export function PdfCard({ cert }: { cert: Certification }) {
  return (
    <div className="absolute inset-0 flex flex-col justify-between bg-fg p-[7%] text-on [container-type:inline-size]">
      <span className="w-max rounded-md border-2 border-on px-1.5 text-[11px] font-black">PDF</span>
      <span>
        <span className="block font-condensed text-[clamp(1rem,7cqw,1.6rem)] font-black uppercase leading-[0.95]">{cert.title}</span>
        <span className="mt-1.5 block text-[12px] font-semibold opacity-70">{[cert.issuer, cert.year].filter(Boolean).join(", ")}</span>
      </span>
    </div>
  );
}

/**
 * Certificates as a plain list, newest first. On desktop, hovering a row
 * floats a preview of the certificate beside the cursor; clicking opens it.
 */
export function Certifications({ certifications }: { certifications: Certification[] }) {
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

  // PDF-only certificates: draw their previews as soon as the list comes near the screen,
  // so the hover preview is ready the first time (desktop only, where that preview exists)
  useEffect(() => {
    const pdfOnly = certifications.filter((c) => !c.image && c.pdf);
    const section = document.getElementById("certificates");
    if (!pdfOnly.length || !section || !window.matchMedia("(hover: hover) and (min-width: 768px)").matches) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return;
        io.disconnect();
        pdfOnly.forEach((c) => pdfPreview(c.pdf!, "small").catch(() => {}));
      },
      { rootMargin: "600px 0px" },
    );
    io.observe(section);
    return () => io.disconnect();
  }, [certifications]);

  const list = showAll ? certifications : certifications.slice(0, 8);
  const issuers = new Set(certifications.map((c) => c.issuer)).size;

  // Place the preview beside the cursor, flipping to the left near the right edge
  const place = (e: React.PointerEvent, jump = false, ratio = hovered?.ratio ?? 1.41) => {
    const h = PREVIEW_W / ratio;
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
      const found = row ? certifications.find((c) => c.id === row.dataset.cert) : undefined;
      if (found) {
        place(e, true, found.ratio);
        setHovered(found);
      }
    }
  };

  return (
    <section id="certificates" className="relative px-5 py-24 md:px-10 md:py-36">
      <div className="scene mx-auto max-w-6xl">
        <SectionHeading title="Certificates">
          {certifications.length} {certifications.length === 1 ? "certificate" : "certificates"}
          {issuers > 0 && ` from ${issuers} ${issuers === 1 ? "organisation" : "organisations"}`}. Open one to see it, or verify it with the issuer.
        </SectionHeading>

        <ul className="mt-12 border-t border-line" onPointerMove={onMove} onPointerLeave={() => setHovered(null)}>
          {list.map((c) => (
            <li key={c.id} className="zoom border-b border-line">
              <button
                data-cert={c.id}
                onClick={() => setOpen(c)}
                onPointerEnter={(e) => {
                  if (e.pointerType !== "mouse") return;
                  place(e, hovered === null, c.ratio);
                  setHovered(c);
                }}
                className="group grid w-full grid-cols-[3.25rem_minmax(0,1fr)] items-baseline gap-x-4 gap-y-1 py-5 text-left md:grid-cols-[4rem_minmax(0,1fr)_14rem] md:gap-x-8"
              >
                <span className="text-[15px] font-medium tabular-nums text-fg-soft">{c.year ?? ""}</span>
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
            <div className="relative" style={{ aspectRatio: hovered.ratio }}>
              {hovered.image ? (
                <Image src={hovered.image} alt="" fill sizes="280px" className="object-contain" />
              ) : hovered.pdf ? (
                <PdfThumb src={hovered.pdf} alt="" loading={<PdfCard cert={hovered} />} />
              ) : (
                <PdfCard cert={hovered} />
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {open && (
          <Lightbox
            image={open.image}
            pdf={open.pdf}
            alt={`${open.title} certificate`}
            ratio={open.ratio}
            title={open.title}
            meta={[open.issuer, open.year].filter(Boolean).join(", ") || undefined}
            onClose={() => setOpen(null)}
          >
            {open.covers.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {open.covers.map((t) => (
                  <span key={t} className="rounded-full border border-line px-3 py-1 text-[15px]">
                    {t}
                  </span>
                ))}
              </div>
            )}
            {open.verify && (
              <a
                href={open.verify}
                target="_blank"
                rel="noreferrer"
                className="mt-2 inline-flex w-max items-center gap-2 rounded-full bg-fg px-5 py-3 font-semibold text-surface hover:bg-fg/85"
              >
                {open.issuer ? `Verify with ${open.issuer}` : "Verify this certificate"}
              </a>
            )}
          </Lightbox>
        )}
      </AnimatePresence>
    </section>
  );
}
