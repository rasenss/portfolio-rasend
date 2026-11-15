"use client";

import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { skillCategories, skillEvidence, skills, type Evidence } from "@/content/profile";
import { labels, type Label } from "@/lib/colors";
import { cn } from "@/lib/cn";
import { SectionHeading } from "@/components/ui/Pill";

const KIND: Record<Evidence["kind"], Label> = { Role: "role", Certificate: "skill", Project: "person" };

/* running index so words alternate solid / outline across the whole poster */
let n = 0;
const groups = skillCategories.map((c) => ({
  ...c,
  color: labels[c.label].color,
  items: skills.filter((s) => s.category === c.key).map((s) => ({ ...s, i: n++ })),
}));

/**
 * Skills set as a type poster: no icons, just the words. Pointing at a word
 * (or tapping it) annotates it with a dashed bounding box and class label,
 * and the caption pinned to the bottom of the screen shows where that skill
 * was proven. Words rise in as they scroll into view (CSS, where supported).
 */
export function Skills() {
  const [selected, setSelected] = useState(skills[0].name);
  const [touch, setTouch] = useState(false);

  useEffect(() => {
    setTouch(window.matchMedia("(hover: none)").matches);
  }, []);

  const current = skills.find((s) => s.name === selected) ?? skills[0];
  const group = groups.find((g) => g.key === current.category)!;
  const evidence = skillEvidence[current.name] ?? [];

  return (
    <section id="skills" className="relative px-5 py-24 md:px-10 md:py-36">
      <div className="scene mx-auto max-w-6xl">
        <SectionHeading title="Skills">
          {skills.length} skills, each backed by a role, certificate or project. {touch ? "Tap" : "Point at"} any of them to see the proof.
        </SectionHeading>

        <div className="mt-16 space-y-14 lg:space-y-16">
          {groups.map((g) => (
            <div key={g.key} className="grid gap-5 lg:grid-cols-[13rem_minmax(0,1fr)] lg:gap-10">
              <p className="pt-1 text-[15px] font-semibold" style={{ color: g.color }}>
                {g.title}
                <span className="ml-2 font-medium tabular-nums text-fg-soft">{g.items.length}</span>
              </p>

              <ul className="flex flex-wrap gap-x-5 gap-y-10">
                {g.items.map((s) => {
                  const sel = selected === s.name;
                  return (
                    <li key={s.name} className="skill-word" style={{ "--i": s.i % 5 } as React.CSSProperties}>
                      <button
                        onPointerEnter={(e) => e.pointerType === "mouse" && setSelected(s.name)}
                        onFocus={() => setSelected(s.name)}
                        onClick={() => setSelected(s.name)}
                        aria-pressed={sel}
                        aria-label={`${s.name}, show proof`}
                        className={cn(
                          "group relative px-2 py-1 text-left font-condensed text-[clamp(2rem,4.6vw,3.7rem)] font-black uppercase leading-[0.95] transition-colors duration-200",
                          sel ? "text-role" : s.i % 2 ? "text-outline-word hover:text-fg" : "text-fg hover:text-role",
                        )}
                      >
                        {s.name}
                        {/* annotation box: draws itself when the word is picked or hovered */}
                        <span aria-hidden className={cn("word-box pointer-events-none absolute -inset-1.5 rounded-[14px] border-2 border-dashed", sel && "is-on")} style={{ borderColor: g.color }} />
                        {sel && (
                          <span
                            aria-hidden
                            className="word-chip pointer-events-none absolute -top-7 left-0 whitespace-nowrap rounded-full px-2.5 py-0.5 font-sans text-[12px] font-bold normal-case tracking-normal text-on"
                            style={{ backgroundColor: g.color }}
                          >
                            {g.className} <span className="opacity-70">{g.confidence.toFixed(2)}</span>
                          </span>
                        )}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>

        {/* proof caption, pinned to the bottom of the screen while the poster is in view */}
        <div className="sticky bottom-4 z-20 mt-16">
          <div className="rounded-[22px] border border-line bg-surface p-4 shadow-[0_-18px_40px_-12px_rgb(0_0_0/0.55)] md:rounded-[24px] md:p-6" aria-live="polite">
            {/* new proof replaces the old one at once and fades in, so the caption is never empty */}
            <motion.div
                key={current.name}
                initial={{ opacity: 0.5, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                className="grid gap-2.5 md:grid-cols-[minmax(0,1fr)_minmax(0,1.7fr)] md:items-center md:gap-8"
              >
                <div className="min-w-0">
                  <p className="text-[13px] font-bold" style={{ color: group.color }}>
                    {group.title}
                  </p>
                  <p className="mt-0.5 font-condensed text-[1.6rem] font-black uppercase leading-[0.95] md:mt-1 md:text-[2.4rem]">{current.name}</p>
                </div>
                <ul className="space-y-1 text-[13px] leading-snug md:space-y-1.5 md:text-[15px]">
                  {evidence.map((e) => (
                    <li key={e.title + e.detail}>
                      <span className="font-bold" style={{ color: labels[KIND[e.kind]].color }}>
                        {e.kind}
                      </span>{" "}
                      <span className="font-semibold">{e.title}</span> <span className="text-fg-soft">({e.detail})</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
