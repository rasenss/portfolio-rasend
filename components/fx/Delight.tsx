"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";

type Box = { id: number; x: number; y: number; w: number; h: number; label: string; conf: string };

const LABELS = ["unlabeled", "good_vibes", "nice_spot", "coffee_break", "looks_right", "needs_review", "human", "masterpiece"];

/**
 * Small surprises:
 *  - the tab title changes while you're on another tab
 *  - type "qa" anywhere to outline every element like an annotation tool
 *  - hold Shift and drag anywhere to draw your own bounding box
 */
export function Delight() {
  const [qa, setQa] = useState(false);
  const [boxes, setBoxes] = useState<Box[]>([]);
  const [draft, setDraft] = useState<Omit<Box, "id" | "label" | "conf"> | null>(null);
  const start = useRef<{ x: number; y: number } | null>(null);
  const nextId = useRef(1);

  useEffect(() => {
    const original = document.title;
    const onVis = () => {
      document.title = document.hidden ? "come back to site!" : original;
    };
    document.addEventListener("visibilitychange", onVis);

    let buffer = "";
    let timer: ReturnType<typeof setTimeout> | undefined;
    const onKey = (e: KeyboardEvent) => {
      const t = e.target;
      if (t instanceof Element && t.closest("input, textarea, [contenteditable]")) return;
      buffer = (buffer + e.key.toLowerCase()).slice(-2);
      if (buffer === "qa") {
        setQa(true);
        document.documentElement.dataset.qa = "on";
        clearTimeout(timer);
        timer = setTimeout(() => {
          setQa(false);
          delete document.documentElement.dataset.qa;
        }, 5000);
      }
    };
    window.addEventListener("keydown", onKey);

    // Shift + drag draws a bounding box
    const rect = (x: number, y: number) => {
      const s = start.current!;
      return { x: Math.min(s.x, x), y: Math.min(s.y, y), w: Math.abs(x - s.x), h: Math.abs(y - s.y) };
    };
    const onDown = (e: PointerEvent) => {
      if (!e.shiftKey || e.pointerType !== "mouse" || e.button !== 0) return;
      if (e.target instanceof Element && e.target.closest("input, textarea, a, button")) return;
      e.preventDefault();
      start.current = { x: e.clientX, y: e.clientY };
      document.documentElement.style.userSelect = "none";
      setDraft({ x: e.clientX, y: e.clientY, w: 0, h: 0 });
    };
    const onMove = (e: PointerEvent) => {
      if (!start.current) return;
      setDraft(rect(e.clientX, e.clientY));
    };
    const onUp = (e: PointerEvent) => {
      if (!start.current) return;
      const r = rect(e.clientX, e.clientY);
      start.current = null;
      document.documentElement.style.userSelect = "";
      setDraft(null);
      if (r.w < 16 || r.h < 16) return;
      const id = nextId.current++;
      const box: Box = {
        id,
        ...r,
        label: LABELS[Math.floor(Math.random() * LABELS.length)],
        conf: (0.7 + Math.random() * 0.29).toFixed(2),
      };
      setBoxes((b) => [...b, box]);
      setTimeout(() => setBoxes((b) => b.filter((x) => x.id !== id)), 2600);
    };
    window.addEventListener("pointerdown", onDown);
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);

    return () => {
      document.removeEventListener("visibilitychange", onVis);
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      clearTimeout(timer);
    };
  }, []);

  return (
    <>
      {/* box being drawn */}
      {draft && (
        <div
          aria-hidden
          className="pointer-events-none fixed z-[90] rounded-[12px] border-2 border-dashed border-role bg-role/10"
          style={{ left: draft.x, top: draft.y, width: draft.w, height: draft.h }}
        />
      )}

      {/* finished boxes: label pops, then they fade */}
      <AnimatePresence>
        {boxes.map((b) => (
          <motion.div
            key={b.id}
            aria-hidden
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.35 }}
            className="pointer-events-none fixed z-[90] rounded-[12px] border-2 border-dashed border-role bg-role/10"
            style={{ left: b.x, top: b.y, width: b.w, height: b.h }}
          >
            <motion.span
              initial={{ y: 8, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ type: "spring", stiffness: 420, damping: 22 }}
              className="absolute -top-8 left-0 whitespace-nowrap rounded-full bg-role px-3 py-1 text-[13px] font-bold text-on"
            >
              {b.label} <span className="font-semibold opacity-70">{b.conf}</span>
            </motion.span>
          </motion.div>
        ))}
      </AnimatePresence>

      <AnimatePresence>
        {qa && (
          <motion.div
            role="status"
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 30, opacity: 0 }}
            className="glass fixed bottom-6 left-1/2 z-[80] -translate-x-1/2 rounded-full px-5 py-3 text-[15px] font-semibold"
          >
            QA mode: every element is outlined for 5 seconds
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
