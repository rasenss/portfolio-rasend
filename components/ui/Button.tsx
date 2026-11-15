"use client";

import { cn } from "@/lib/cn";

type Variant = "solid" | "outline" | "role";

type Props = {
  children: React.ReactNode;
  href?: string;
  onClick?: () => void;
  variant?: Variant;
  icon?: React.ReactNode;
  className?: string;
  download?: boolean;
  external?: boolean;
  type?: "button" | "submit";
};

/*
 * Each variant has a resting colour and an amber (or bone) fill that sweeps
 * in from the left on hover, with the label switching to dark text.
 */
const styles: Record<Variant, string> = {
  solid: "bg-fg text-on hover:text-on",
  outline: "border-2 border-fg text-fg hover:text-on [--sweep:var(--color-fg)]",
  role: "bg-role text-on [--sweep:var(--color-fg)]",
};

export function Button({ children, href, onClick, variant = "solid", icon, className, download, external, type = "button" }: Props) {
  const cls = cn(
    "btn-sweep inline-flex items-center justify-center gap-2 rounded-full px-6 py-3.5 text-base font-semibold transition-[color,transform] duration-300 active:scale-[0.97]",
    styles[variant],
    className,
  );
  const content = (
    <>
      {children}
      {icon}
    </>
  );
  if (href) {
    return (
      <a href={href} onClick={onClick} className={cls} download={download || undefined} target={external ? "_blank" : undefined} rel={external ? "noreferrer" : undefined}>
        {content}
      </a>
    );
  }
  return (
    <button type={type} onClick={onClick} className={cls}>
      {content}
    </button>
  );
}
