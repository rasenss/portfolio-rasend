import fs from "node:fs";
import path from "node:path";
import { cacheLife } from "next/cache";
import type { Certification, Experience, Project } from "@/lib/content-types";
import { mediaRatio } from "@/lib/media";

/*
 * Reads the growing parts of the site straight from folders, so adding something means
 * dropping a file in, never editing code. The rules for naming files are in
 * "HOW TO ADD CONTENT.md" at the top of the project.
 *
 *   public/certificates/   certificate pictures and PDFs   ("2027 - Issuer - Title.pdf")
 *   public/work/           design work images              ("App design - Title.png")
 *   content/experience/    one text file per job
 *
 * A file that can't be understood is skipped (and named in the terminal), so one typo can
 * never break the page.
 *
 * Each folder is read once and remembered ("use cache"), so the site stays fully static and
 * fast. The memory is keyed on the folder's file names: add, remove or rename a file and the
 * next page load reads the folder again. (After only editing the words inside a text file
 * while developing, do a hard refresh: Cmd+Shift+R.)
 */

const ROOT = process.cwd();
const IMAGE = /\.(png|jpe?g|webp|avif|gif|svg)$/i;
const PDF = /\.pdf$/i;
const NOTES = /\.(txt|md)$/i;
// the only words treated as labels; any other "something:" line is just text
const KEYS = new Set(["title", "issuer", "year", "verify", "covers", "topics", "kind", "type", "description", "about", "link", "company", "role", "start", "end", "project", "period"]);
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function list(dir: string): string[] {
  try {
    return fs.readdirSync(path.join(ROOT, dir)).filter((f) => !f.startsWith(".") && !f.startsWith("_"));
  } catch {
    return [];
  }
}

function warn(file: string, why: string) {
  console.warn(`[content] Skipped "${file}": ${why}`);
}

const baseName = (f: string) => f.replace(/\.[^.]+$/, "");
/**
 * Web address of a file in public/. Pictures keep their plain name (spaces and all): the
 * image component encodes it exactly once itself, and encoding it here too breaks the
 * picture on some servers. Links that go straight to a file (PDFs) are encoded here.
 */
const imagePath = (dir: string, f: string) => `/${dir.replace(/^public\//, "")}/${f}`;
const fileLink = (dir: string, f: string) => `/${dir.replace(/^public\//, "")}/${encodeURIComponent(f)}`;

/** "learn_basic-of ai" -> "Learn basic of ai" (only used when a file name doesn't follow the pattern) */
const tidy = (s: string) => {
  const t = s.replace(/[_]+/g, " ").replace(/\s+/g, " ").trim();
  return t.charAt(0).toUpperCase() + t.slice(1);
};

/**
 * Reads "key: value" lines from a notes file. Lines starting with "-", "*" or "•" are list
 * items; any other line continues the value above it (for long descriptions).
 */
function readNotes(file: string): { fields: Record<string, string>; items: string[] } {
  const fields: Record<string, string> = {};
  const items: string[] = [];
  let last: string | null = null;
  let text = "";
  try {
    text = fs.readFileSync(file, "utf8");
  } catch {
    return { fields, items };
  }
  for (const raw of text.replace(/^﻿/, "").split(/\r?\n/)) {
    const line = raw.trim();
    if (!line || line === "---") {
      last = null;
      continue;
    }
    const bullet = line.match(/^[-*•]\s+(.*)$/);
    if (bullet) {
      items.push(bullet[1].trim());
      last = null;
      continue;
    }
    const kv = line.match(/^([A-Za-z]+):\s*(.*)$/);
    if (kv && KEYS.has(kv[1].toLowerCase())) {
      last = kv[1].trim().toLowerCase();
      fields[last] = kv[2].trim();
      continue;
    }
    if (last) fields[last] = `${fields[last]} ${line}`.trim();
    else if (items.length) items[items.length - 1] += ` ${line}`;
  }
  return { fields, items };
}

/** A notes file sitting next to a picture or PDF with the same name (".txt" or ".md") */
function notesFor(dir: string, files: string[], base: string) {
  const match = files.find((f) => NOTES.test(f) && baseName(f) === base);
  return match ? readNotes(path.join(ROOT, dir, match)) : { fields: {}, items: [] };
}

const splitList = (s?: string) =>
  (s ?? "")
    .split(/[,;]/)
    .map((x) => x.trim())
    .filter(Boolean);

/** "Open in Figma | https://…" or just a link, with a sensible button label */
function readLink(value?: string): { label: string; href: string } | undefined {
  if (!value) return undefined;
  const [a, b] = value.split("|").map((s) => s.trim());
  const href = b ?? a;
  if (!/^https?:\/\//i.test(href)) return undefined;
  if (b) return { label: a, href };
  const host = new URL(href).hostname;
  const label = /figma\./.test(host) ? "Open in Figma" : /linkedin\./.test(host) ? "View on LinkedIn" : /behance\./.test(host) ? "View on Behance" : /dribbble\./.test(host) ? "View on Dribbble" : "Open link";
  return { label, href };
}

/* ------------------------------------------------------------------ */
/* Certificates: public/certificates                                   */
/* ------------------------------------------------------------------ */

/** the folder's file names: the key that tells the cache when something was added or removed */
const fingerprint = (dir: string) => list(dir).sort().join("\n");

export async function getCertificates(): Promise<Certification[]> {
  return readCertificates(fingerprint("public/certificates"));
}

async function readCertificates(_files: string): Promise<Certification[]> {
  "use cache";
  cacheLife("max");
  const dir = "public/certificates";
  const files = list(dir);
  const bases = Array.from(new Set(files.filter((f) => IMAGE.test(f) || PDF.test(f)).map(baseName)));

  const out: (Certification & { month: number })[] = [];
  for (const base of bases) {
    try {
      const image = files.find((f) => baseName(f) === base && IMAGE.test(f)) ?? null;
      const pdf = files.find((f) => baseName(f) === base && PDF.test(f)) ?? null;
      const { fields } = notesFor(dir, files, base);

      // "2027 - Issuer - Title" or "2027-05 - Issuer - Title"; anything else still shows, titled from the name
      const parts = base.split(/\s+-\s+/);
      const date = parts[0]?.match(/^(\d{4})(?:[-.](\d{1,2}))?$/);
      let year: number | null = null;
      let month = 0;
      let issuer = "";
      let title = tidy(base);
      if (date && parts.length >= 3) {
        year = parseInt(date[1], 10);
        month = date[2] ? parseInt(date[2], 10) : 0;
        issuer = parts[1].trim();
        title = parts.slice(2).join(" - ").trim();
      } else if (date && parts.length === 2) {
        year = parseInt(date[1], 10);
        title = parts[1].trim();
      }
      if (fields.title) title = fields.title;
      if (fields.issuer) issuer = fields.issuer;
      if (fields.year && /^\d{4}$/.test(fields.year)) year = parseInt(fields.year, 10);

      const ratio = (image && mediaRatio(path.join(ROOT, dir, image))) || (pdf && mediaRatio(path.join(ROOT, dir, pdf))) || 1200 / 849;
      out.push({
        id: base,
        title,
        issuer,
        year,
        month,
        image: image ? imagePath(dir, image) : null,
        pdf: pdf ? fileLink(dir, pdf) : null,
        ratio,
        verify: readLink(fields.verify)?.href,
        covers: splitList(fields.covers ?? fields.topics),
      });
    } catch (e) {
      warn(base, (e as Error).message);
    }
  }

  // newest first; same year: by month if given, then A to Z
  return out
    .sort((a, b) => (b.year ?? 0) - (a.year ?? 0) || b.month - a.month || a.title.localeCompare(b.title))
    .map(({ month: _month, ...c }) => c);
}

/* ------------------------------------------------------------------ */
/* Design work: public/work                                            */
/* ------------------------------------------------------------------ */

export async function getProjects(): Promise<Project[]> {
  return readProjects(fingerprint("public/work"));
}

async function readProjects(_files: string): Promise<Project[]> {
  "use cache";
  cacheLife("max");
  const dir = "public/work";
  const files = list(dir);
  const out: (Project & { order: number })[] = [];

  for (const file of files.filter((f) => IMAGE.test(f))) {
    const base = baseName(file);
    try {
      const { fields } = notesFor(dir, files, base);
      // optional position number first: "03 - Posters - Title"
      const numbered = base.match(/^(\d{1,3})\s*[-.)]\s*(.+)$/);
      const order = numbered ? parseInt(numbered[1], 10) : -1;
      const rest = numbered ? numbered[2] : base;
      const parts = rest.split(/\s+-\s+/);
      let kind = parts.length >= 2 ? parts[0].trim() : "Design";
      let title = parts.length >= 2 ? parts.slice(1).join(" - ").trim() : tidy(rest);
      if (fields.title) title = fields.title;
      if (fields.kind || fields.type) kind = (fields.kind || fields.type).trim();

      out.push({
        id: base,
        title,
        kind,
        image: imagePath(dir, file),
        ratio: mediaRatio(path.join(ROOT, dir, file)) ?? 4 / 3,
        description: fields.description ?? fields.about ?? "",
        link: readLink(fields.link),
        order,
      });
    } catch (e) {
      warn(file, (e as Error).message);
    }
  }

  // un-numbered (new) pieces first, A to Z; then numbered ones in their order
  return out
    .sort((a, b) => (a.order === -1 ? -1 : a.order) - (b.order === -1 ? -1 : b.order) || a.title.localeCompare(b.title))
    .map(({ order: _order, ...p }) => p);
}

/* ------------------------------------------------------------------ */
/* Experience: content/experience                                      */
/* ------------------------------------------------------------------ */

const NOW = /^(now|present|current|today|-)?$/i;

function month(ym: string) {
  const m = ym.match(/^(\d{4})-(\d{1,2})$/);
  return m ? { y: parseInt(m[1], 10), m: parseInt(m[2], 10) } : null;
}

/** "Apr 2025 – now", "Jul – Aug 2026", "Sep 2026", "Oct 2024 – Jan 2025" */
function period(start: string, end: string, current: boolean) {
  const s = month(start);
  if (!s) return start;
  const sTxt = `${MONTHS[s.m - 1]} ${s.y}`;
  if (current) return `${sTxt} – now`;
  const e = month(end);
  if (!e) return sTxt;
  if (e.y === s.y && e.m === s.m) return sTxt;
  if (e.y === s.y) return `${MONTHS[s.m - 1]} – ${MONTHS[e.m - 1]} ${e.y}`;
  return `${sTxt} – ${MONTHS[e.m - 1]} ${e.y}`;
}

export async function getExperience(): Promise<Experience[]> {
  return readExperience(fingerprint("content/experience"));
}

async function readExperience(_files: string): Promise<Experience[]> {
  "use cache";
  cacheLife("max");
  const dir = "content/experience";
  const out: Experience[] = [];
  for (const file of list(dir).filter((f) => NOTES.test(f))) {
    try {
      const { fields, items } = readNotes(path.join(ROOT, dir, file));
      const start = (fields.start ?? "").replace(/\//g, "-");
      if (!fields.company || !fields.role || !month(start)) {
        warn(file, "it needs at least company, role and start (like 2027-01)");
        continue;
      }
      const endRaw = (fields.end ?? "").trim();
      const current = NOW.test(endRaw);
      const end = current ? "" : endRaw.replace(/\//g, "-");
      out.push({
        id: baseName(file),
        company: fields.company,
        role: fields.role,
        type: fields.type ?? "",
        period: fields.period || period(start, end, current),
        start,
        end,
        current,
        project: fields.project || undefined,
        points: items,
      });
    } catch (e) {
      warn(file, (e as Error).message);
    }
  }
  return out;
}
