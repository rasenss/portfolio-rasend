import { cn } from "@/lib/cn";
import { labels, type Label } from "@/lib/colors";

/** A flat label chip in one of the highlighter colours. */
export function Tag({ children, type = "role", className }: { children: React.ReactNode; type?: Label; className?: string }) {
  return (
    <span className={cn("inline-flex items-center rounded-full px-3 py-1 text-sm font-semibold text-on", className)} style={{ backgroundColor: labels[type].color }}>
      {children}
    </span>
  );
}

/**
 * Section heading: heavy condensed title with an amber mark that sweeps in
 * as it scrolls into view, plus an optional one-line description.
 */
export function SectionHeading({ title, children, className }: { title: string; children?: React.ReactNode; className?: string }) {
  return (
    <div className={cn("max-w-2xl", className)}>
      <h2 className="title-slam font-condensed text-[clamp(2.9rem,7vw,5.6rem)] font-black uppercase leading-[0.9] tracking-[-0.01em]">{title}</h2>
      <span aria-hidden className="heading-mark mt-4 block h-[5px] w-20 rounded-full bg-role" />
      {children && <p className="reveal mt-6 text-lg leading-relaxed text-fg-soft md:text-xl">{children}</p>}
    </div>
  );
}
