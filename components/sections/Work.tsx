"use client";

import { AnimatePresence, motion } from "motion/react";
import Image from "next/image";
import { useState } from "react";
import type { Project } from "@/lib/content-types";
import { labels, type Label } from "@/lib/colors";
import { cn } from "@/lib/cn";
import { Lightbox } from "@/components/ui/Lightbox";
import { NewLabel } from "@/components/ui/NewTag";
import { useNewSince } from "@/lib/new-since";
import { SectionHeading } from "@/components/ui/Pill";

// the usual kinds keep their colours; any new kind you invent gets the next colour in turn
const knownKinds: Record<string, Label> = {
  "app design": "person",
  posters: "org",
  "linkedin posts": "place",
  logos: "skill",
};
const spare: Label[] = ["role", "person", "org", "place", "skill"];

function colourFor(kind: string, allKinds: string[]) {
  const known = knownKinds[kind.toLowerCase()];
  if (known) return labels[known].color;
  const n = allKinds.filter((k) => !knownKinds[k.toLowerCase()]).indexOf(kind);
  return labels[spare[Math.max(0, n) % spare.length]].color;
}

/** Logos and icons sit on white and are never cropped */
const isMark = (kind: string) => /logo|icon|brand|emblem/i.test(kind);

/** A project tile. On hover or focus it gets an annotation box labelled with its type. */
function Tile({ project, index, color, isNew, onOpen }: { project: Project; index: number; color: string; isNew: boolean; onOpen: () => void }) {
  const isLogo = isMark(project.kind);
  return (
    <button onClick={onOpen} className="zoom group mb-5 block w-full break-inside-avoid text-left" data-i={index}>
      <span className="glass-panel relative block rounded-[24px] p-2 transition-colors group-hover:border-fg group-focus-visible:border-fg">
        <span className={cn("relative block overflow-clip rounded-[18px]", isLogo && "bg-white")} style={{ aspectRatio: project.ratio }}>
          {/* hover zoom lives on a wrapper: the scroll push-in animation owns the image's own transform */}
          <span className="absolute inset-0 block transition-transform duration-500 ease-[var(--ease-out-expo)] group-hover:scale-[1.03]">
            <Image
              src={project.image}
              alt={project.title}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 380px"
              className={cn("img-zoom", isLogo ? "object-contain p-[12%]" : "object-cover")}
            />
          </span>
          {/* annotation overlay */}
          <span aria-hidden className="pointer-events-none absolute inset-3 rounded-[14px] border-2 border-dashed border-role opacity-0 transition-opacity duration-200 group-hover:opacity-100 group-focus-visible:opacity-100" />
          <span
            aria-hidden
            className="pointer-events-none absolute left-3 top-3 translate-y-1 rounded-full px-3 py-1 text-[13px] font-semibold text-on opacity-0 transition-[opacity,transform] duration-200 group-hover:translate-y-0 group-hover:opacity-100 group-focus-visible:translate-y-0 group-focus-visible:opacity-100"
            style={{ backgroundColor: color }}
          >
            {project.kind.toLowerCase()}
          </span>
        </span>
        <span className="block px-2 pb-1.5 pt-3">
          <span className="block text-lg font-bold leading-snug">
            {project.title}
            {isNew && <NewLabel className="ml-2" />}
          </span>
          <span className="block text-[15px] text-fg-soft">{project.kind}</span>
        </span>
      </span>
    </button>
  );
}

export function Work({ projects }: { projects: Project[] }) {
  const allKinds = Array.from(new Set(projects.map((p) => p.kind)));
  const kinds = ["All", ...allKinds];
  const [kind, setKind] = useState("All");
  const fresh = useNewSince("work", projects.map((p) => p.id));
  const [open, setOpen] = useState<Project | null>(null);
  const shown = kind === "All" ? projects : projects.filter((p) => p.kind === kind);

  return (
    <section id="work" className="relative px-5 py-24 md:px-10 md:py-36">
      <div className="scene mx-auto max-w-6xl">
        <SectionHeading title="Design work">
          App screens, posters, LinkedIn covers and logos I&apos;ve designed. Open any piece to see it full size.
          {fresh.size > 0 && <span className="font-semibold text-role"> {fresh.size} new since your last visit.</span>}
        </SectionHeading>

        <div className="mt-10 flex flex-wrap gap-2" role="group" aria-label="Filter design work">
          {kinds.map((k) => (
            <button
              key={k}
              aria-pressed={kind === k}
              onClick={() => setKind(k)}
              className={cn("relative rounded-full border px-4 py-2 text-[15px] font-medium transition-colors", kind === k ? "border-fg text-surface" : "glass-chip hover:border-fg")}
            >
              {kind === k && <motion.span layoutId="work-filter" className="absolute inset-0 rounded-full bg-fg" transition={{ type: "spring", stiffness: 420, damping: 32 }} />}
              <span className="relative">{k}</span>
            </button>
          ))}
        </div>

        <motion.div
          key={kind}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          className="mt-10 columns-1 gap-5 sm:columns-2 lg:columns-3"
        >
          {shown.map((p, i) => (
            <Tile key={p.id} project={p} index={i} color={colourFor(p.kind, allKinds)} isNew={fresh.has(p.id)} onOpen={() => setOpen(p)} />
          ))}
        </motion.div>
      </div>

      <AnimatePresence>
        {open && (
          <Lightbox image={open.image} alt={open.title} ratio={open.ratio} title={open.title} meta={open.kind} onClose={() => setOpen(null)}>
            {open.description && <p className="text-lg leading-relaxed">{open.description}</p>}
            {open.link && (
              <a
                href={open.link.href}
                target="_blank"
                rel="noreferrer"
                className="mt-2 inline-flex w-max items-center gap-2 rounded-full bg-fg px-5 py-3 font-semibold text-surface hover:bg-fg/85"
              >
                {open.link.label}
              </a>
            )}
          </Lightbox>
        )}
      </AnimatePresence>
    </section>
  );
}
