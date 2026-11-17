import { cn } from "@/lib/cn";

/** Frosted glass panel: the universe behind shows through, softly blurred, with a light rim. */
export function Panel({ className, children, ...rest }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("glass-panel rounded-[28px]", className)} {...rest}>
      {children}
    </div>
  );
}
