"use client";

import Image from "next/image";
import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { education, languages, profile } from "@/content/profile";
import { labels } from "@/lib/colors";
import { AnnotationBox } from "@/components/fx/AnnotationBox";
import { Panel } from "@/components/ui/GlassCard";
import { SectionHeading } from "@/components/ui/Pill";

function LocalTime() {
  const [time, setTime] = useState<string | null>(null);
  useEffect(() => {
    const fmt = new Intl.DateTimeFormat("en-GB", { hour: "2-digit", minute: "2-digit", timeZone: profile.timezone });
    const tick = () => setTime(fmt.format(new Date()));
    tick();
    const id = setInterval(tick, 15_000);
    return () => clearInterval(id);
  }, []);
  if (!time) return null;
  return <span className="text-fg-soft"> (it&apos;s {time} there now)</span>;
}

function Portrait() {
  return (
    <div className="relative aspect-[4/5] w-full overflow-hidden rounded-[22px]">
      {profile.portrait ? (
        <Image src={profile.portrait} alt={profile.name} fill sizes="(max-width: 768px) 100vw, 380px" className="object-cover" />
      ) : (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-person">
          <span className="font-condensed text-[7rem] font-black leading-none text-on">{profile.initials}</span>
          <span className="rounded-full bg-surface px-3 py-1 text-xs font-medium text-fg-soft">Add a photo at public/rasendriya.webp</span>
        </div>
      )}
    </div>
  );
}

export function About() {
  return (
    <section id="about" className="relative px-5 py-24 md:px-10 md:py-36">
      <div className="scene mx-auto grid max-w-6xl gap-16 lg:grid-cols-[380px_minmax(0,1fr)] lg:gap-20">
        <div className="zoom pt-12">
          <AnnotationBox label="rasendriya" type="person" confidence={1} className="block w-full">
            <Portrait />
          </AnnotationBox>
        </div>

        <div>
          <SectionHeading title="About" />
          <p className="zoom-in mt-8 max-w-[38rem] text-xl leading-[1.65] text-fg md:text-[1.35rem]">{profile.summary}</p>

          <dl className="zoom mt-12 grid gap-x-10 gap-y-8 sm:grid-cols-2">
            <div>
              <dt className="text-sm font-semibold text-fg-soft">Studying</dt>
              <dd className="mt-1.5 text-lg leading-snug">
                {education.degree} at {education.school}, {education.period}. GPA {education.gpa}.
              </dd>
            </div>
            <div>
              <dt className="text-sm font-semibold text-fg-soft">Based in</dt>
              <dd className="mt-1.5 text-lg leading-snug">
                {profile.location}
                <LocalTime />
              </dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="text-sm font-semibold text-fg-soft">Extra training</dt>
              <dd className="mt-2.5 flex flex-wrap gap-2">
                {education.training.map((t) => (
                  <span key={t} className="rounded-full border border-line bg-surface px-3.5 py-1.5 text-[15px]">
                    {t}
                  </span>
                ))}
              </dd>
            </div>
          </dl>

          <Panel className="zoom mt-12 p-6 md:p-8">
            <h3 className="text-lg font-bold">Languages I annotate in</h3>
            <ul className="mt-5 space-y-4">
              {languages.map((l, i) => (
                <li key={l.name}>
                  <div className="flex items-baseline justify-between gap-4 text-[17px]">
                    <span className="font-semibold">{l.name}</span>
                    <span className="text-fg-soft">{l.level}</span>
                  </div>
                  <div className="mt-2 h-3 overflow-hidden rounded-full bg-base">
                    <motion.div
                      className="h-full rounded-full"
                      style={{ backgroundColor: labels.place.color }}
                      initial={{ width: "0%" }}
                      whileInView={{ width: `${l.fill}%` }}
                      viewport={{ once: true, margin: "-10% 0px" }}
                      transition={{ duration: 1.1, delay: i * 0.12, ease: [0.16, 1, 0.3, 1] }}
                    />
                  </div>
                </li>
              ))}
            </ul>
          </Panel>
        </div>
      </div>
    </section>
  );
}
