"use client";

import { useRef } from "react";
import { gsap } from "@/lib/gsap";
import { labels, type Label } from "@/lib/colors";
import { cn } from "@/lib/cn";

type Props = {
  children: React.ReactNode;
  label: string;
  type?: Label;
  confidence?: number;
  /** play the CSS draw + scan sequence on load (hero). Otherwise the box is static. */
  animate?: boolean;
  className?: string;
};

/**
 * A dashed bounding box with corner handles and a label chip, like an
 * object-detection annotation. In the hero it draws itself, a scan line
 * sweeps through it, and it flashes once when "detected". All of that is
 * CSS, so it renders before JavaScript loads. Hovering re-rolls the score.
 */
export function AnnotationBox({ children, label, type = "person", confidence = 0.98, animate = false, className }: Props) {
  const conf = useRef<HTMLSpanElement>(null);
  const color = labels[type].color;

  const reroll = () => {
    if (!conf.current || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const next = Math.min(0.999, Math.max(0.9, confidence + (Math.random() - 0.5) * 0.08)).toFixed(2);
    gsap.to(conf.current, { duration: 0.5, scrambleText: { text: next, chars: "0123456789", speed: 0.6 } });
  };

  const handle = "absolute h-3 w-3 rounded-[4px] border-2 border-fg bg-base";

  return (
    <span className={cn("relative inline-block cursor-crosshair", className)} onPointerEnter={reroll}>
      {children}
      <span aria-hidden className="pointer-events-none absolute -inset-3 md:-inset-4">
        <span
          className={cn("absolute inset-0 overflow-hidden rounded-[20px] border-2 border-dashed border-fg/80", animate && "bbox-frame")}
          style={{ backgroundColor: `${color}1A` }}
        >
          {animate && <span className="bbox-scan absolute inset-x-0 h-[3px]" style={{ backgroundColor: color }} />}
        </span>
        <span className={cn(handle, "-left-1.5 -top-1.5", animate && "bbox-handle")} />
        <span className={cn(handle, "-right-1.5 -top-1.5", animate && "bbox-handle")} />
        <span className={cn(handle, "-bottom-1.5 -left-1.5", animate && "bbox-handle")} />
        <span className={cn(handle, "-bottom-1.5 -right-1.5", animate && "bbox-handle")} />
      </span>
      <span
        aria-hidden
        className={cn(
          "pointer-events-none absolute -left-3 -top-11 z-10 whitespace-nowrap rounded-full px-3 py-1 text-sm font-semibold normal-case tracking-normal text-on md:-left-4 md:-top-12",
          animate && "bbox-chip",
        )}
        style={{ backgroundColor: color }}
      >
        {label} <span ref={conf} className="tabular-nums opacity-70">{confidence.toFixed(2)}</span>
      </span>
    </span>
  );
}
