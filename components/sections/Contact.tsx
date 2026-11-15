"use client";

import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { profile } from "@/content/profile";
import { copyText } from "@/lib/copy";
import { SectionHeading } from "@/components/ui/Pill";

/**
 * Contact, styled after the response editor in an evaluation tool.
 * The message is handed to the visitor's own email: Gmail in a new tab (works without any
 * mail app set up), their email app, or copied to paste anywhere. Plain links are used
 * rather than script redirects, because browsers and in-app browsers treat links reliably.
 */
export function Contact() {
  const [copied, setCopied] = useState(false);
  const [form, setForm] = useState({ name: "", message: "" });
  const [note, setNote] = useState<string | null>(null);

  const subject = `Hello from ${form.name.trim() || "your portfolio"}`;
  const body = form.message.trim() + (form.name.trim() ? `\n\n${form.name.trim()}` : "");
  const gmail = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(profile.email)}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  const mailto = `mailto:${profile.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  const empty = form.message.trim().length === 0;

  const flash = (text: string) => {
    setNote(text);
    setTimeout(() => setNote(null), 3500);
  };

  // stop an empty message going out, with a friendly hint instead
  const guard = (e: React.MouseEvent) => {
    if (!empty) return;
    e.preventDefault();
    flash("Write a message first.");
    document.getElementById("c-msg")?.focus();
  };

  const copyMessage = async () => {
    if (empty) return flash("Write a message first.");
    const ok = await copyText(`To: ${profile.email}\nSubject: ${subject}\n\n${body}`);
    flash(ok ? `Copied. Paste it into any email to ${profile.email}.` : `Couldn't copy here. Please email ${profile.email} directly.`);
  };

  const copy = async () => {
    if (await copyText(profile.email)) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } else {
      window.location.href = `mailto:${profile.email}`;
    }
  };

  // pressing Enter in the name field sends with Gmail, like the main button
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (empty) {
      flash("Write a message first.");
      document.getElementById("c-msg")?.focus();
      return;
    }
    window.open(gmail, "_blank", "noopener");
  };

  const field = "w-full rounded-[18px] border-2 border-line bg-surface px-5 py-4 text-lg outline-none transition-colors placeholder:text-fg-soft/70 focus:border-fg";

  return (
    <section id="contact" className="relative px-5 py-24 md:px-10 md:py-36">
      <div className="scene mx-auto grid max-w-6xl gap-14 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:gap-20">
        <div>
          <SectionHeading title="Get in touch">
            Hiring for annotation or evaluation work, or need UI/UX design? Send me a message and I&apos;ll reply by email.
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
              <div className="ml-auto flex flex-wrap items-center justify-end gap-2">
                <a
                  href={mailto}
                  onClick={guard}
                  className="inline-flex items-center justify-center rounded-full border-2 border-line px-5 py-3 text-[1rem] font-semibold text-fg transition-colors hover:border-fg"
                >
                  Email app
                </a>
                <a
                  href={gmail}
                  target="_blank"
                  rel="noreferrer"
                  onClick={guard}
                  className="btn-sweep inline-flex items-center justify-center rounded-full bg-fg px-6 py-3.5 text-[1rem] font-semibold text-on transition-[color,transform] duration-300 active:scale-[0.97]"
                >
                  Send with Gmail
                </a>
              </div>
            </div>
            <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 text-[14px] text-fg-soft" aria-live="polite">
              <span className={note ? "font-semibold text-role" : undefined}>{note ?? "No Gmail? Use your email app, or copy the message."}</span>
              <button type="button" onClick={copyMessage} className="font-semibold text-fg underline decoration-line decoration-2 underline-offset-4 hover:decoration-fg">
                Copy message
              </button>
            </div>
          </div>
        </form>
      </div>
    </section>
  );
}
