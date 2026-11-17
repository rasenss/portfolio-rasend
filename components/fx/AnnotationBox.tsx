"use client";

import { useEffect, useRef, useState } from "react";
import { labels, type Label } from "@/lib/colors";
import { cn } from "@/lib/cn";

type Props = {
  children: React.ReactNode;
  type?: Label;
  /**
   * Draw the box in like a detection: the outline traces itself, a scan line sweeps through,
   * the handles pop in and the box flashes once. "load" plays it when the page opens (hero),
   * "view" plays it the first time the box scrolls into view.
   */
  animate?: boolean | "load" | "view";
  /**
   * Frosted glass inside the box: the box sits behind its content and blurs the 3D
   * background through it. Only for boxes around text (the hero name), never over a photo.
   */
  glass?: boolean;
  /**
   * An animation class for the words, the box and its handles, applied to each separately.
   * Glass can only blur the page behind it if nothing it sits inside is fading or blurring,
   * so a fly-away animation has to go on the box itself rather than on a wrapper around it.
   */
  pieceClass?: string;
  /**
   * The corner handles can be dragged to stretch the box, like in an annotation tool, and
   * what's inside stretches with it:
   * - "scale" stretches the content itself (good for type: the name grows with the box);
   * - "fill" lets the content fill the new box without distorting it (good for photos: the
   *   picture shows more of itself, re-cropped). The content reads the offsets from the
   *   --bx-l/t/r/b variables, see the .bx-fill class.
   * The box only stretches outwards and springs back to fit when you let go, so a section can
   * never be left looking broken.
   */
  resizable?: false | "scale" | "fill";
  className?: string;
};

type Corner = "tl" | "tr" | "bl" | "br";
type Edges = { l: number; t: number; r: number; b: number };
const ZERO: Edges = { l: 0, t: 0, r: 0, b: 0 };
const CORNERS: { c: Corner; pos: string; cursor: string }[] = [
  { c: "tl", pos: "-left-1.5 -top-1.5", cursor: "cursor-nwse-resize" },
  { c: "tr", pos: "-right-1.5 -top-1.5", cursor: "cursor-nesw-resize" },
  { c: "bl", pos: "-bottom-1.5 -left-1.5", cursor: "cursor-nesw-resize" },
  { c: "br", pos: "-bottom-1.5 -right-1.5", cursor: "cursor-nwse-resize" },
];
const MAX = 320; // furthest an edge can be pulled out, in px
const SPRING = "cubic-bezier(0.34, 1.56, 0.64, 1)";

/**
 * A dashed bounding box with corner handles, like an object-detection annotation.
 * The draw-in sequence is CSS, so in the hero it renders before JavaScript loads.
 * With `resizable`, the handles work: drag any corner to stretch the box (with a live
 * width × height readout, like a design tool); let go and it springs back to fit.
 */
export function AnnotationBox({ children, type = "person", animate = false, glass = false, pieceClass, resizable = false, className }: Props) {
  const color = labels[type].color;
  const mode = animate === true ? "load" : animate || null;
  const root = useRef<HTMLSpanElement>(null);
  const natural = useRef<HTMLSpanElement>(null); // the box at its natural (fitted) size
  const start = useRef({ x: 0, y: 0, e: ZERO, k: 1 });
  const pointer = useRef<number | null>(null); // the one pointer doing the stretching
  const [edge, setEdge] = useState<Edges>(ZERO);
  const [size, setSize] = useState({ w: 1, h: 1 }); // fitted size, measured when a drag starts
  const [drag, setDrag] = useState<Corner | null>(null);
  const [springing, setSpringing] = useState(false);
  const [seen, setSeen] = useState(mode !== "view");

  // "view": wait until the box is on screen before drawing it in
  useEffect(() => {
    if (mode !== "view" || seen) return;
    const el = root.current;
    if (!el || typeof IntersectionObserver === "undefined") return setSeen(true);
    const io = new IntersectionObserver(([e]) => e.isIntersecting && setSeen(true), { threshold: 0.35 });
    io.observe(el);
    return () => io.disconnect();
  }, [mode, seen]);
  const drawing = mode && seen; // the draw-in classes are on
  const pending = mode === "view" && !seen; // hidden until it comes into view

  // the box and its handles are offset from the fitted size by however far you've dragged
  const box: React.CSSProperties = { left: -edge.l, top: -edge.t, right: -edge.r, bottom: -edge.b };
  const springMs = 700;
  const spring = springing && "transition-[left,top,right,bottom] duration-700 ease-[cubic-bezier(0.34,1.56,0.64,1)]";

  const down = (c: Corner) => (e: React.PointerEvent<HTMLSpanElement>) => {
    const el = natural.current;
    // one stretch at a time (a second finger on another handle is ignored)
    if (!el || e.button > 0 || pointer.current !== null) return;
    e.preventDefault();
    e.stopPropagation();
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      /* capture unavailable: moves still arrive while the pointer is over the handle */
    }
    pointer.current = e.pointerId;
    setSpringing(false);
    // Sizes in the page's own pixels. A section can be mid-zoom (scaled) while you grab it, so
    // pointer movement on screen is converted back by that scale, and the box follows the finger.
    const w = el.offsetWidth || 1;
    const h = el.offsetHeight || 1;
    const k = el.getBoundingClientRect().width / w || 1;
    setSize({ w, h });
    start.current = { x: e.clientX, y: e.clientY, e: edge, k };
    setDrag(c);
  };
  const move = (e: React.PointerEvent<HTMLSpanElement>) => {
    if (!drag || e.pointerId !== pointer.current) return;
    const s = start.current;
    const dx = (e.clientX - s.x) / s.k;
    const dy = (e.clientY - s.y) / s.k;
    // each edge only moves outwards from the fitted box, up to MAX
    const clamp = (v: number) => Math.min(MAX, Math.max(0, v));
    let { l, t, r, b } = s.e;
    if (drag === "tl" || drag === "bl") l = clamp(s.e.l - dx);
    else r = clamp(s.e.r + dx);
    if (drag === "tl" || drag === "tr") t = clamp(s.e.t - dy);
    else b = clamp(s.e.b + dy);
    setEdge({ l, t, r, b });
  };
  // let go, lift the finger, or lose the pointer (window switch, system gesture): always ends cleanly
  const up = (e: React.PointerEvent<HTMLSpanElement>) => {
    if (e.pointerId !== pointer.current) return;
    pointer.current = null;
    try {
      if (e.currentTarget.hasPointerCapture(e.pointerId)) e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      /* already released */
    }
    setDrag(null);
    // let go: everything springs back to fit
    setSpringing(true);
    setEdge(ZERO);
  };
  // once the spring has settled, drop the transition so the next drag follows the pointer exactly
  useEffect(() => {
    if (!springing) return;
    const id = window.setTimeout(() => setSpringing(false), springMs + 50);
    return () => window.clearTimeout(id);
  }, [springing]);

  // "scale": the content stretches with the box, mapped from the fitted box onto the new one
  const sx = (size.w + edge.l + edge.r) / size.w;
  const sy = (size.h + edge.t + edge.b) / size.h;
  const scaled: React.CSSProperties | undefined =
    resizable === "scale"
      ? {
          translate: `${(edge.r - edge.l) / 2}px ${(edge.b - edge.t) / 2}px`,
          scale: `${sx} ${sy}`,
          transition: springing ? `translate ${springMs}ms ${SPRING}, scale ${springMs}ms ${SPRING}` : undefined,
        }
      : undefined;

  const handle = "absolute h-3 w-3 rounded-[4px] border-2 border-fg bg-base";
  const wrapped = pieceClass || resizable === "scale";

  return (
    <span
      ref={root}
      className={cn("relative inline-block cursor-crosshair", springing && "bx-springing", className)}
      // "fill" content reads how far the box has been stretched on each side
      style={{ "--bx-l": `${edge.l}px`, "--bx-t": `${edge.t}px`, "--bx-r": `${edge.r}px`, "--bx-b": `${edge.b}px` } as React.CSSProperties}
    >
      {wrapped ? (
        <span className={cn("block", pieceClass)} style={scaled}>
          {children}
        </span>
      ) : (
        children
      )}

      {/* the box. With glass it goes behind the words, so the blur never touches the text itself */}
      <span ref={natural} aria-hidden className={cn("pointer-events-none absolute -inset-3 md:-inset-4", glass && "-z-10")}>
        <span
          className={cn(
            "absolute overflow-hidden rounded-[20px] border-2 border-dashed border-fg/80",
            drawing && "bbox-frame",
            pending && "bbox-pending",
            glass && "glass-frame",
            spring,
            pieceClass,
          )}
          style={{ ...box, ...(glass ? null : { backgroundColor: `${color}1A` }) }}
        >
          {drawing && <span className="bbox-scan absolute inset-x-0 h-[3px]" style={{ backgroundColor: color }} />}
        </span>
      </span>

      {/* the handles sit on their own layer above the page, so they can be grabbed */}
      <span aria-hidden className="pointer-events-none absolute -inset-3 md:-inset-4">
        <span className={cn("absolute", spring, pieceClass)} style={box}>
          {CORNERS.map(({ c, pos, cursor }) => (
            <span
              key={c}
              className={cn(
                handle,
                pos,
                drawing && "bbox-handle",
                pending && "scale-0",
                resizable && [
                  "pointer-events-auto touch-none transition-[scale,background-color] duration-200 hover:scale-[1.45] hover:bg-role",
                  // a larger invisible grab area, easier to catch with a finger
                  "before:absolute before:-inset-3 before:content-['']",
                  cursor,
                  drag === c && "scale-[1.45] bg-role",
                ],
              )}
              onPointerDown={resizable ? down(c) : undefined}
              onPointerMove={resizable ? move : undefined}
              onPointerUp={resizable ? up : undefined}
              onPointerCancel={resizable ? up : undefined}
              onLostPointerCapture={resizable ? up : undefined}
              // don't let a drag count as a click on what's inside (the hero name replays its detection)
              onClick={resizable ? (e) => e.stopPropagation() : undefined}
              title={resizable ? "Drag to stretch the box" : undefined}
            />
          ))}
        </span>
      </span>

      {/* live size readout while stretching, like a design tool */}
      {drag && (
        <span
          aria-hidden
          className="pointer-events-none absolute left-1/2 z-20 -translate-x-1/2 whitespace-nowrap rounded-full bg-role px-2.5 py-1 font-sans text-[13px] font-semibold normal-case tabular-nums tracking-normal text-on [font-variation-settings:normal]"
          style={{ top: `calc(100% + ${edge.b + 28}px)` }}
        >
          {Math.round(size.w + edge.l + edge.r)} × {Math.round(size.h + edge.t + edge.b)}
        </span>
      )}
    </span>
  );
}
