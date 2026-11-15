"use client";

import { useLenis } from "lenis/react";
import { motion } from "motion/react";
import { X } from "lucide-react";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";

type Props = {
  /** picture to show; when missing and there's a PDF, the PDF is shown instead */
  image: string | null;
  pdf?: string | null;
  alt: string;
  ratio: number;
  title: string;
  meta?: string;
  children?: React.ReactNode;
  onClose: () => void;
};

/**
 * Full-screen glass viewer for a project or certificate. Shows the picture, or the PDF itself
 * when there's no picture (browsers that can't show PDFs inside a page, like Chrome on
 * Android, get a big "Open PDF" button instead). Esc or the backdrop closes it.
 */
export function Lightbox({ image, pdf, alt, ratio, title, meta, children, onClose }: Props) {
  const lenis = useLenis();
  const closeBtn = useRef<HTMLButtonElement>(null);
  // can this browser show a PDF inside the page? (decided after mount, so server and browser agree)
  const [inlinePdf, setInlinePdf] = useState(false);
  useEffect(() => {
    const nav = navigator as Navigator & { pdfViewerEnabled?: boolean };
    setInlinePdf(nav.pdfViewerEnabled === true);
  }, []);

  useEffect(() => {
    lenis?.stop();
    closeBtn.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      lenis?.start();
    };
  }, [lenis, onClose]);

  const tall = ratio < 1;

  return (
    <motion.div
      className="fixed inset-0 z-[80] flex items-center justify-center p-3 md:p-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <div className="absolute inset-0 bg-fg/30 backdrop-blur-[3px]" onClick={onClose} />
      <motion.div
        initial={{ y: 24, scale: 0.98 }}
        animate={{ y: 0, scale: 1 }}
        exit={{ y: 16, scale: 0.98 }}
        transition={{ type: "spring", stiffness: 320, damping: 30 }}
        className={`glass relative flex max-h-[92vh] w-full flex-col overflow-hidden rounded-[32px] !bg-surface/92 ${tall ? "max-w-3xl md:flex-row" : "max-w-5xl"}`}
        data-lenis-prevent
      >
        <div className={`relative shrink-0 bg-base ${tall ? "md:w-[55%]" : ""}`}>
          <div className="relative mx-auto w-full" style={{ aspectRatio: ratio, maxHeight: tall ? "80vh" : "62vh", maxWidth: tall ? undefined : `calc(62vh * ${ratio})` }}>
            {image ? (
              <Image src={image} alt={alt} fill sizes="(max-width: 768px) 100vw, 900px" className="object-contain" />
            ) : pdf && inlinePdf ? (
              <iframe src={`${pdf}#toolbar=0&navpanes=0&view=Fit`} title={alt} className="absolute inset-0 h-full w-full border-0 bg-white" />
            ) : pdf ? (
              <a href={pdf} target="_blank" rel="noreferrer" className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-fg p-6 text-center text-on">
                <span className="rounded-md border-2 border-on px-2 text-sm font-black">PDF</span>
                <span className="font-condensed text-2xl font-black uppercase leading-none">{title}</span>
                <span className="mt-1 rounded-full bg-on px-4 py-2 text-[15px] font-semibold text-fg">Open PDF</span>
              </a>
            ) : null}
          </div>
        </div>
        <div className="flex min-w-0 flex-1 flex-col gap-3 overflow-y-auto p-6 md:p-8">
          {meta && <p className="text-[15px] font-medium text-fg-soft">{meta}</p>}
          <h3 className="pr-12 text-2xl font-extrabold leading-tight tracking-[-0.02em] md:text-3xl">{title}</h3>
          {children}
          {pdf && (
            <a
              href={pdf}
              target="_blank"
              rel="noreferrer"
              className="mt-2 inline-flex w-max items-center gap-2 rounded-full border border-line px-5 py-3 font-semibold hover:border-fg"
            >
              Open PDF
            </a>
          )}
        </div>
        <button
          ref={closeBtn}
          onClick={onClose}
          aria-label="Close"
          className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full border border-line bg-surface hover:border-fg"
        >
          <X size={18} />
        </button>
      </motion.div>
    </motion.div>
  );
}
