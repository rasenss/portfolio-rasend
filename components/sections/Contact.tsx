"use client";

import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { profile } from "@/content/profile";
import { Button } from "@/components/ui/Button";
import { SectionHeading } from "@/components/ui/Pill";

/**
 * Contact, styled after the response editor in an evaluation tool.
 * The form opens the visitor's email app with the message filled in.
 */
export function Contact() {
  const [copied, setCopied] = useState(false);
  const [form, setForm] = useState({ name: "", message: "" });

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(profile.email);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      window.location.href = `mailto:${profile.email}`;
    }
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const subject = encodeURIComponent(`Hello from ${form.name || "your portfolio"}`);
    const body = encodeURIComponent(form.message);
    window.location.href = `mailto:${profile.email}?subject=${subject}&body=${body}`;
  };

  const field = "w-full rounded-[18px] border-2 border-line bg-surface px-5 py-4 text-lg outline-none transition-colors placeholder:text-fg-soft/70 focus:border-fg";

  return (
    <section id="contact" className="relative px-5 py-24 md:px-10 md:py-36">
      <div className="scene mx-auto grid max-w-6xl gap-14 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:gap-20">
        <div>
          <SectionHeading title="Get in touch">
            Hiring for annotation or evaluation work, or need a front-end built? Send me a message and I&apos;ll reply by email.
          </SectionHeading>

          <div className="mt-10 flex flex-col gap-3">
            <button onClick={copy} className="zoom flex w-full max-w-sm items-center justify-between gap-3 rounded-[18px] border border-line bg-surface px-5 py-4 text-left transition-colors hover:border-fg">
              <span className="truncate text-lg font-semibold">{profile.email}</span>
              <span className="flex shrink-0 items-center gap-1.5 text-[15px] font-medium text-fg-soft">
                {copied ? "Copied" : "Copy email"}
              </span>
            </button>
            {[
              { label: "LinkedIn", href: profile.links.linkedin, handle: "rasendriya-khansa" },
              { label: "GitHub", href: profile.links.github, handle: "rasenss" },
              { label: "Instagram", href: profile.links.instagram, handle: "@rasendkhansa" },
              { label: "Discord", href: profile.links.discord, handle: "_.rasend" },
            ]
              .filter((l): l is { label: string; href: string; handle: string } => Boolean(l.href))
              .map((l) => (
                <a
                  key={l.label}
                  href={l.href}
                  target="_blank"
                  rel="noreferrer"
                  className="zoom flex w-full max-w-sm items-center justify-between gap-3 rounded-[18px] border border-line bg-surface px-5 py-4 transition-colors hover:border-fg"
                >
                  <span className="text-lg font-semibold">{l.label}</span>
                  <span className="truncate text-[15px] font-medium text-fg-soft">{l.handle}</span>
                </a>
              ))}
          </div>
        </div>

        <form onSubmit={submit} className="zoom-in self-start rounded-[32px] bg-role p-3 text-on">
          <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 px-4 pb-3 pt-2">
            <span className="text-[15px] font-bold">Your response</span>
            <span className="text-[15px] font-medium">Goes to {profile.firstName}&apos;s inbox</span>
          </div>
          <div className="flex flex-col gap-3 rounded-[24px] bg-surface p-4 text-fg md:p-5">
            <label htmlFor="c-name" className="text-[15px] font-semibold">
              Your name
            </label>
            <input id="c-name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={field} autoComplete="name" />
            <label htmlFor="c-msg" className="mt-2 text-[15px] font-semibold">
              Message
            </label>
            <textarea
              id="c-msg"
              rows={5}
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
              placeholder="Hi Rasendriya, I'd like to talk about…"
              className={`${field} resize-none`}
            />
            <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
              <AnimatePresence>
                {form.message.length > 0 && (
                  <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-[15px] text-fg-soft">
                    {form.message.trim().split(/\s+/).filter(Boolean).length} words
                  </motion.span>
                )}
              </AnimatePresence>
              <Button type="submit" className="ml-auto">
                Open in email app
              </Button>
            </div>
          </div>
        </form>
      </div>
    </section>
  );
}
