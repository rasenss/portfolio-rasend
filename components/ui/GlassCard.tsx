import { cn } from "@/lib/cn";

/** Flat panel: paper-white surface with a hairline border. Glass is reserved for floating layers. */
export function Panel({ className, children, ...rest }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("rounded-[28px] border border-line bg-surface", className)} {...rest}>
      {children}
    </div>
  );
}
