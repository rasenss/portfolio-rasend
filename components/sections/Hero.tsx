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

function renderSegment(seg: Segment, i: number, key: number) {
  if (typeof seg === "string") return <span key={key}>{seg}</span>;
  return (
    <span
      key={key}
      data-type={seg.type}
      className="ent ent-animate"
      style={{ "--c": labels[seg.type].color, "--i": i } as React.CSSProperties}
    >
      {seg.text}
      <span className="ent-tag">{seg.type}</span>
    </span>
  );
}

const counts = intro.flat().reduce<Record<string, number>>((acc, s) => {
  if (typeof s !== "string") acc[s.type] = (acc[s.type] ?? 0) + 1;
  return acc;
}, {});
const legend = (Object.keys(labels) as Label[]).filter((k) => counts[k]);

export function Hero() {
  const [focus, setFocus] = useState<Label | null>(null);
  const [run, setRun] = useState(0);

  return (
    <section id="top" className="relative px-5 pb-24 pt-40 md:px-10 md:pb-32 md:pt-48">
      <div className="mx-auto max-w-6xl">
        {/* Surprise: clicking the name remounts the box, which replays the whole detection sequence */}
        <h1
          className="zoom-out text-[clamp(2rem,12.4vw,9.6rem)] uppercase leading-[0.84] tracking-[-0.005em]"
          onClick={() => setRun((n) => n + 1)}
          title="Click to run detection again"
        >
          <span className="sr-only">{profile.name}</span>
          <AnnotationBox key={run} label="person" type="person" confidence={0.99} animate>
            <ProximityName text={profile.firstName} />
            <ProximityName text={profile.lastName} start={profile.firstName.replace(/\s/g, "").length} className="text-role" />
          </AnnotationBox>
        </h1>

        <div className="mt-20 grid gap-12 lg:grid-cols-[minmax(0,1fr)_260px] lg:gap-16" data-focus={focus ?? undefined}>
          <div className="max-w-[46rem] space-y-6 text-[clamp(1.3rem,2.2vw,1.8rem)] font-medium leading-[1.6]">
            {indexed.map((para, p) => (
              <p key={p} className="zoom-out">{para.map(({ seg, i }, k) => renderSegment(seg, i, k))}</p>
            ))}
          </div>

          {/* Label legend, like the class list in an annotation tool */}
          <aside className="intro-fade self-start" style={{ "--d": "2.4s" } as React.CSSProperties}>
            <div className="zoom-out glass rounded-[24px] p-5">
              <p className="text-sm font-semibold text-fg-soft">Labels in this paragraph</p>
              <ul className="mt-3 space-y-1">
                {legend.map((k) => (
                  <li key={k}>
                    <button
                      onPointerEnter={() => setFocus(k)}
                      onPointerLeave={() => setFocus(null)}
                      onFocus={() => setFocus(k)}
                      onBlur={() => setFocus(null)}
                      className={cn("flex w-full items-center justify-between rounded-xl px-2 py-1.5 text-left text-[15px] font-medium transition-colors", focus === k && "bg-fg/5")}
                    >
                      <span className="flex items-center gap-2.5">
                        <span className="h-4 w-4 rounded-[5px]" style={{ backgroundColor: labels[k].color }} />
                        {labels[k].name}
                      </span>
                      <span className="tabular-nums text-fg-soft">{counts[k]}</span>
                    </button>
                  </li>
                ))}
              </ul>
              <p className="mt-3 text-[13px] leading-snug text-fg-soft">Hover a label to see where it appears.</p>
            </div>
          </aside>
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
