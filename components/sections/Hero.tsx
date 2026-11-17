"use client";

import { useRef, useState } from "react";
import { intro, profile, type Segment } from "@/content/profile";
import { labels, type Label } from "@/lib/colors";
import { cn } from "@/lib/cn";
import { gsap } from "@/lib/gsap";
import { AnnotationBox } from "@/components/fx/AnnotationBox";
import { Button } from "@/components/ui/Button";

/**
 * Name set in Archivo's condensed cut. Letters rise in on load (CSS), and near
 * the cursor they widen along the font's width axis, like a lens passing over.
 */
function ProximityName({ text, start = 0, className }: { text: string; start?: number; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  // letter centres, measured once when the pointer arrives (relative to the name, so scrolling doesn't matter)
  const centres = useRef<{ el: HTMLElement; x: number; y: number }[]>([]);
  const widths = useRef<number[]>([]);
  const frame = useRef(0);
  const pointer = useRef({ x: 0, y: 0 });

  const measure = () => {
    const root = ref.current;
    if (!root) return;
    const box = root.getBoundingClientRect();
    centres.current = Array.from(root.querySelectorAll<HTMLElement>("[data-letter]")).map((el) => {
      const r = el.getBoundingClientRect();
      return { el, x: r.left - box.left + r.width / 2, y: r.top - box.top + r.height / 2 };
    });
    widths.current = centres.current.map(() => 72);
  };

  const update = () => {
    frame.current = 0;
    const root = ref.current;
    if (!root) return;
    const box = root.getBoundingClientRect();
    const px = pointer.current.x - box.left;
    const py = pointer.current.y - box.top;
    centres.current.forEach((c, i) => {
      const wdth = gsap.utils.clamp(72, 100, 100 - Math.hypot(px - c.x, py - c.y) * 0.14);
      if (Math.abs(wdth - widths.current[i]) < 0.75) return;
      widths.current[i] = wdth;
      gsap.to(c.el, { fontVariationSettings: `"wght" 900, "wdth" ${wdth.toFixed(1)}`, duration: 0.4, ease: "power2.out", overwrite: "auto" });
    });
  };

  const onEnter = (e: React.PointerEvent) => {
    if (e.pointerType === "mouse") measure();
  };
  const onMove = (e: React.PointerEvent) => {
    if (e.pointerType !== "mouse" || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (!centres.current.length) measure();
    pointer.current = { x: e.clientX, y: e.clientY };
    if (!frame.current) frame.current = requestAnimationFrame(update);
  };
  const onLeave = () => {
    if (frame.current) cancelAnimationFrame(frame.current);
    frame.current = 0;
    const letters = ref.current?.querySelectorAll<HTMLElement>("[data-letter]");
    if (letters) gsap.to(letters, { fontVariationSettings: `"wght" 900, "wdth" 72`, duration: 0.8, ease: "elastic.out(1, 0.5)", overwrite: "auto" });
    centres.current = [];
  };

  // Each word stays in one piece; a name with several words wraps between words, never inside one
  const words = text.split(/\s+/).filter(Boolean);
  let n = start;
  return (
    <span ref={ref} onPointerEnter={onEnter} onPointerMove={onMove} onPointerLeave={onLeave} className={cn("flex flex-wrap gap-x-[0.22em]", className)} aria-hidden>
      {words.map((word, w) => (
        <span key={w} className="flex">
          {word.split("").map((c, i) => (
            <span key={i} className="letter-mask">
              <span
                data-letter
                className="letter-in inline-block"
                style={{ "--i": n++, fontVariationSettings: `"wght" 900, "wdth" 72` } as React.CSSProperties}
              >
                {c}
              </span>
            </span>
          ))}
        </span>
      ))}
    </span>
  );
}

// Give every highlighted entity a running index so the highlighter sweeps them in order
let counter = 0;
const indexed = intro.map((para) => para.map((seg) => ({ seg, i: typeof seg === "string" ? -1 : counter++ })));

function renderSegment(seg: Segment, i: number, key: number, point: (type: Label | null) => void) {
  if (typeof seg === "string") return <span key={key}>{seg}</span>;
  const cut = seg.text.lastIndexOf(" ") + 1;
  const head = seg.text.slice(0, cut);
  const last = seg.text.slice(cut);
  return (
    <span
      key={key}
      data-type={seg.type}
      className="ent ent-animate"
      style={{ "--c": labels[seg.type].color, "--i": i } as React.CSSProperties}
      // pointing at a span picks out every span with the same label
      onPointerEnter={(e) => e.pointerType === "mouse" && point(seg.type)}
      onPointerLeave={(e) => e.pointerType === "mouse" && point(null)}
    >
      {head}
      {/* the last word and the label chip stay together, so a chip never wraps onto a line by itself */}
      <span className="whitespace-nowrap">
        {last}
        <span className="ent-tag">{seg.type}</span>
      </span>
    </span>
  );
}

export function Hero() {
  const [focus, setFocus] = useState<Label | null>(null);
  const [run, setRun] = useState(0);

  return (
    <section id="top" className="relative px-5 pb-24 pt-40 md:px-10 md:pb-32 md:pt-48">
      <div className="mx-auto max-w-6xl">
        {/* Surprise: clicking the name remounts the box, which replays the whole detection sequence */}
        <h1
          className="hero-name text-[clamp(2rem,12.4vw,9.6rem)] uppercase leading-[0.84] tracking-[-0.005em]"
          onClick={() => setRun((n) => n + 1)}
          title="Click to run detection again"
        >
          <span className="sr-only">{profile.name}</span>
          <AnnotationBox key={run} type="person" animate="load" glass resizable="scale" pieceClass="hero-fly">
            <ProximityName text={profile.firstName} />
            <ProximityName text={profile.lastName} start={profile.firstName.replace(/\s/g, "").length} className="text-role" />
          </AnnotationBox>
        </h1>

        {/* pointing at a highlighted phrase picks out every phrase with the same label */}
        <div className="mt-20 max-w-[46rem] space-y-6 text-[clamp(1.3rem,2.2vw,1.8rem)] font-medium leading-[1.6]" data-focus={focus ?? undefined}>
          {indexed.map((para, p) => (
            <p key={p} className="zoom-out glass-panel rounded-[24px] px-5 py-4 md:px-7 md:py-6">{para.map(({ seg, i }, k) => renderSegment(seg, i, k, setFocus))}</p>
          ))}
        </div>

        <div className="zoom-out mt-14">
          <div className="intro-fade flex flex-wrap gap-3" style={{ "--d": "2.2s" } as React.CSSProperties}>
            <Button href="#work" variant="solid">
              See my work
            </Button>
            <Button href={profile.cv} variant="outline" download="Rasendriya_Khansa_Jolankarfyan-CV.pdf">
              Download CV
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
