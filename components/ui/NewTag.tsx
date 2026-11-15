"use client";

import { useNewSince } from "@/lib/new-since";
import { cn } from "@/lib/cn";

/** The "new" label itself */
export function NewLabel({ className }: { className?: string }) {
  return (
    <span className={cn("new-tag inline-flex items-center rounded-full border-[1.5px] border-role px-2 py-px align-middle font-sans text-[12px] font-bold normal-case leading-[1.4] tracking-normal text-role", className)}>
      new
    </span>
  );
}

/** "new" label on something added since this visitor last came by (for server-rendered lists) */
export function NewTag({ scope, id, all, className }: { scope: string; id: string; all: string[]; className?: string }) {
  const fresh = useNewSince(scope, all);
  return fresh.has(id) ? <NewLabel className={className} /> : null;
}

/** "· 2 new since your last visit", or nothing */
export function NewCount({ scope, all }: { scope: string; all: string[] }) {
  const fresh = useNewSince(scope, all);
  if (!fresh.size) return null;
  return (
    <span className="font-semibold text-role">
      {" "}
      {fresh.size} new since your last visit.
    </span>
  );
}
