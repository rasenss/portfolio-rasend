"use client";

import { useLenis } from "lenis/react";
import { motion } from "motion/react";
import { X } from "lucide-react";
import Image from "next/image";
import { useEffect, useRef } from "react";

type Props = {
  image: string;
  alt: string;
  ratio: number;
  title: string;
  meta?: string;
  children?: React.ReactNode;
  onClose: () => void;
};

/** Full-screen glass viewer for a project or certificate image. Esc or the backdrop closes it. */
export function Lightbox({ image, alt, ratio, title, meta, children, onClose }: Props) {
  const lenis = useLenis();
  const closeBtn = useRef<HTMLButtonElement>(null);

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
            <Image src={image} alt={alt} fill sizes="(max-width: 768px) 100vw, 900px" className="object-contain" />
          </div>
        </div>
        <div className="flex min-w-0 flex-1 flex-col gap-3 overflow-y-auto p-6 md:p-8">
          {meta && <p className="text-[15px] font-medium text-fg-soft">{meta}</p>}
          <h3 className="pr-12 text-2xl font-extrabold leading-tight tracking-[-0.02em] md:text-3xl">{title}</h3>
          {children}
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
