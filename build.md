# build.md — Rasendriya Khansa Portfolio

> **Superseded (15 Nov 2026):** the visual direction in this plan (gradients, aurora glow, glass everywhere, preloader, 3D blob) was replaced by a flat "annotation tool" design. See README.md for the current tokens. The stack and section structure below still apply.

> A playful, glassy, heavily-animated portfolio for **Rasendriya Khansa Jolankarfyan**, an AI Data Annotator & Front-End Developer based in Pacitan, East Java, Indonesia.
> Hand this file to yourself (or a coding agent) and build top to bottom.

---

## 0. The Creative Concept: "Labeled by Hand"

Rasendriya's day job is **teaching AI to see and read**: drawing bounding boxes, ranking responses, writing golden answers, checking that images and text match. The site turns that work into its visual language:

| Annotation idea | How it shows up on the site |
|---|---|
| **Bounding boxes** | Dashed, rounded selection boxes draw themselves around headings, photos and cards as you scroll, each with a little label chip (`label: developer · conf 0.98`). |
| **Preference ranking** | An interactive "Rank me" card stack in the About section. Visitors drag cards to vote and the cards reshuffle with spring physics. |
| **Golden response** | The contact section is styled like a "golden response" editor with a shimmering gold glass border. |
| **Cross-modal alignment** | Skills section: hovering an icon draws an animated SVG line to its matching text label, "aligning" them. |
| **Pipeline** | Experience is a horizontal, scroll-pinned "data pipeline" of glass cards connected by a flowing gradient line. |

The mood is **soft and dreamy**: an aurora of pastel blobs behind frosted-glass panels, very rounded corners, gentle spring motion, and a few loud moments where something flips, morphs or explodes into particles.

---

## 1. Tech Stack (verified November 2026)

| Layer | Choice | Version | Why |
|---|---|---|---|
| Framework | **Next.js** (App Router, Turbopack) | `16.4.x` (latest stable, Oct 2026, plus the Nov 3 2026 security patch) | Cache Components are on by default, builds are faster, and it ships React 19.3 |
| UI runtime | **React** | `19.3` | **Stable View Transitions** (for page/section morphs), Fragment Refs |
| Language | **TypeScript** | latest | Type-safe content data |
| Styling | **Tailwind CSS v4** | `4.3.x` | CSS-first `@theme` tokens, Oxide engine, no `tailwind.config.js` |
| UI animation | **Motion** (formerly Framer Motion) | `13.x` (`motion` package, `motion/react`) | Springs, layout animations, gestures, drag-to-rank |
| Scroll / timeline | **GSAP + ScrollTrigger + SplitText + DrawSVG + MorphSVG + Flip** | `3.15.x` | **All plugins are 100% free now** (Webflow), and `@gsap/react` gives you the `useGSAP()` hook |
| Smooth scroll | **Lenis** | `1.3.26+` (`lenis/react`) | Butter scrolling, respects `prefers-reduced-motion` by default |
| 3D | **React Three Fiber + Drei** | latest (R3F v9+, React 19 compatible) | Glass/transmission 3D blob in the hero |
| Icons | **lucide-react** + **simple-icons** | latest | UI icons + tech brand icons |
| Utilities | `clsx`, `tailwind-merge` | latest | `cn()` helper |
| Fonts | `next/font/google` | — | Self-hosted, zero layout shift |
| Deploy | **Vercel** | — | Matches the existing `rasend-portfolio.vercel.app` |

> **Always run `npm install <pkg>@latest`.** The versions above were current on 15 Nov 2026; minor versions move fast.

---

## 2. Project Setup

```bash
# 1. Create the app. Recent create-next-app defaults are TypeScript, Tailwind v4,
#    App Router, Turbopack and Cache Components.
npx create-next-app@latest rasend-portfolio --yes
cd rasend-portfolio

# 2. Animation + scroll
npm install motion gsap @gsap/react lenis

# 3. 3D
npm install three @react-three/fiber @react-three/drei
npm install -D @types/three

# 4. Utilities + icons
npm install clsx tailwind-merge lucide-react simple-icons

# 5. Run
npm run dev
```

### `next.config.ts`

```ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,      // default in new 16.4 apps
  partialPrefetching: true,   // part of the Cache Components model
  reactCompiler: true,        // auto-memoization, so you don't need useMemo everywhere
  images: {
    formats: ["image/avif", "image/webp"],
  },
  experimental: {
    // Uncomment if your Next version still gates React View Transitions behind a flag:
    // viewTransition: true,
  },
};

export default nextConfig;
```

### Keep the whole site static

The portfolio has no per-user data, so guarantee every route is prerendered:

```tsx
// app/layout.tsx (top of file)
export const ensureStatic = "navigation"; // Next 16.4: build fails if anything dynamic sneaks in
```

---

## 3. Folder Structure

```
rasend-portfolio/
├── app/
│   ├── layout.tsx            # fonts, metadata, providers, grain overlay, cursor
│   ├── page.tsx              # one-page story: all sections
│   ├── globals.css           # Tailwind v4 @theme tokens + glass utilities
│   ├── opengraph-image.tsx   # dynamic OG card (glass + name)
│   ├── icon.svg              # favicon (rounded "RK" monogram)
│   └── not-found.tsx         # playful 404 ("This sample was rejected by QA")
├── components/
│   ├── providers/
│   │   └── SmoothScroll.tsx  # Lenis + GSAP ticker sync
│   ├── fx/
│   │   ├── AuroraBackground.tsx
│   │   ├── GrainOverlay.tsx
│   │   ├── CustomCursor.tsx
│   │   ├── Magnetic.tsx
│   │   ├── AnnotationBox.tsx # the signature dashed bounding box
│   │   ├── SplitReveal.tsx   # GSAP SplitText headline reveals
│   │   ├── Marquee.tsx
│   │   └── Preloader.tsx
│   ├── three/
│   │   └── GlassBlob.tsx     # R3F transmission blob
│   ├── ui/
│   │   ├── GlassCard.tsx
│   │   ├── Pill.tsx
│   │   └── Button.tsx
│   └── sections/
│       ├── Nav.tsx
│       ├── Hero.tsx
│       ├── About.tsx
│       ├── RankMe.tsx
│       ├── Experience.tsx
│       ├── Skills.tsx
│       ├── Certifications.tsx
│       ├── Languages.tsx
│       ├── Contact.tsx
│       └── Footer.tsx
├── content/
│   └── profile.ts            # ALL text content lives here (single source of truth)
├── lib/
│   ├── cn.ts
│   └── gsap.ts               # register plugins once
└── public/
    ├── rasendriya.webp       # portrait (add your own photo)
    └── cv.pdf                # downloadable resume
```

---

## 4. Design System

### 4.1 Palette: "Pastel Aurora on Midnight Plum"

| Token | Hex | Use |
|---|---|---|
| `ink` | `#0E0B1F` | Page background (deep plum-black) |
| `ink-2` | `#171331` | Raised surfaces |
| `cloud` | `#F5F1FF` | Primary text |
| `mist` | `#B9B3D6` | Secondary text |
| `lilac` | `#B8A4FF` | Primary accent, links, focus rings |
| `peach` | `#FFB8A0` | Warm accent, CTAs |
| `mint` | `#9FF0D4` | Success, "approved" chips |
| `butter` | `#FFE59E` | Gold for the "golden response" |
| `sky` | `#9CC9FF` | Cool accent for 3D lighting |

**Light mode** (optional toggle): background `#F7F3FF`, text `#1B1636`, same accents at 85% saturation.

### 4.2 Typography

| Role | Font | Notes |
|---|---|---|
| Display | **Bricolage Grotesque** (variable) | Huge, tight tracking (`-0.04em`), animate `wght` axis on hover |
| Body | **Geist** | 16–18px, relaxed leading |
| Labels / annotations | **Geist Mono** | Tiny uppercase chips: `LABEL: FRONTEND · CONF 0.97` |
| Accent italic | **Instrument Serif** italic | One or two words per heading, e.g. "teaching machines to *see*" |

### 4.3 Shape and Glass Rules

- Radii: `rounded-[28px]` cards, `rounded-full` pills/buttons, `rounded-[40px]` hero panels. **No sharp corners anywhere.**
- Glass = `bg-white/[0.06]` + `backdrop-blur-2xl` + `border border-white/15` + inner highlight + soft colored shadow.
- Every glass panel gets a **moving specular highlight** that follows the cursor (CSS variable driven).
- A subtle **film grain** overlay (SVG noise, 6% opacity) over everything keeps the gradients from banding.

### 4.4 `app/globals.css`

```css
@import "tailwindcss";

@theme {
  --color-ink: #0E0B1F;
  --color-ink-2: #171331;
  --color-cloud: #F5F1FF;
  --color-mist: #B9B3D6;
  --color-lilac: #B8A4FF;
  --color-peach: #FFB8A0;
  --color-mint: #9FF0D4;
  --color-butter: #FFE59E;
  --color-sky: #9CC9FF;

  --font-display: var(--font-bricolage), ui-sans-serif, system-ui;
  --font-sans: var(--font-geist), ui-sans-serif, system-ui;
  --font-mono: var(--font-geist-mono), ui-monospace;
  --font-serif: var(--font-instrument), ui-serif, Georgia;

  --radius-blob: 2.5rem;
  --ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1);
  --ease-out-expo: cubic-bezier(0.16, 1, 0.3, 1);

  --animate-float: float 8s ease-in-out infinite;
  --animate-shimmer: shimmer 3s linear infinite;
  --animate-dash: dash 1.2s linear infinite;

  @keyframes float {
    0%, 100% { transform: translateY(0) rotate(0deg); }
    50% { transform: translateY(-14px) rotate(2deg); }
  }
  @keyframes shimmer {
    to { background-position: 200% center; }
  }
  @keyframes dash {
    to { stroke-dashoffset: -24; }
  }
}

@layer base {
  html { background: var(--color-ink); color: var(--color-cloud); }
  ::selection { background: var(--color-lilac); color: var(--color-ink); }
}

/* Glass surface with cursor-following highlight */
@utility glass {
  position: relative;
  background:
    radial-gradient(400px circle at var(--mx, 50%) var(--my, 0%),
      rgb(255 255 255 / 0.12), transparent 40%),
    rgb(255 255 255 / 0.05);
  backdrop-filter: blur(24px) saturate(160%);
  -webkit-backdrop-filter: blur(24px) saturate(160%);
  border: 1px solid rgb(255 255 255 / 0.14);
  box-shadow:
    inset 0 1px 0 rgb(255 255 255 / 0.18),
    0 20px 60px -20px rgb(184 164 255 / 0.35);
  border-radius: 28px;
}

/* Animated gradient text */
@utility text-aurora {
  background: linear-gradient(90deg, var(--color-lilac), var(--color-peach),
    var(--color-mint), var(--color-sky), var(--color-lilac));
  background-size: 200% auto;
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  animation: var(--animate-shimmer);
}

/* Golden response border */
@utility border-golden {
  border: 1.5px solid transparent;
  background:
    linear-gradient(var(--color-ink-2), var(--color-ink-2)) padding-box,
    conic-gradient(from var(--angle, 0deg), var(--color-butter), var(--color-peach),
      var(--color-butter), #fff6d6, var(--color-butter)) border-box;
}

@property --angle {
  syntax: "<angle>";
  initial-value: 0deg;
  inherits: false;
}

@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## 5. Content (single source of truth)

> Filled from Rasendriya's resume. LinkedIn couldn't be fetched automatically, so check the LinkedIn profile for anything extra (featured posts, recommendations, volunteer work, a profile photo or banner) and add it here.

### `content/profile.ts`

```ts
export const profile = {
  name: "Rasendriya Khansa Jolankarfyan",
  shortName: "Rasendriya",
  nickname: "Rasend",
  roles: ["AI Data Annotator", "Language Evaluator", "Front-End Developer", "UI/UX Enthusiast"],
  location: "Pacitan, East Java, Indonesia",
  email: "rasuen27@gmail.com",
  links: {
    linkedin: "https://www.linkedin.com/in/rasendriya-khansa/",
    portfolio: "https://rasend-portfolio.vercel.app",
    // github: "https://github.com/...",   // add if available
  },
  headline: "I teach machines to see, read, and respond, then build the interfaces humans actually touch.",
  summary:
    "Final-year Computer Science student with over a year of hands-on experience in AI data annotation and language evaluation, currently contributing to active evaluation projects at OneForma. Skilled in rubric-based evaluation, golden-response writing, and cross-modal alignment review, with a technical foundation in HTML5, CSS3, JavaScript, React, and SQL that adds analytical depth to front-end problem solving.",
  stats: [
    { value: 1, suffix: "+ yr", label: "AI annotation & evaluation" },
    { value: 6, suffix: "", label: "Roles across 5 companies" },
    { value: 300, suffix: "+ hrs", label: "freeCodeCamp coursework" },
    { value: 3.51, suffix: " GPA", label: "Computer Science", decimals: 2 },
  ],
};

export const education = {
  school: "Siber Muhammadiyah University",
  place: "Special Region of Yogyakarta, Indonesia",
  degree: "Undergraduate, Computer Science",
  period: "2022 – Present",
  gpa: "3.51 / 4.00",
  extras: [
    "Red Hat Academy Program Learner (2024)",
    "Blue Team Junior Analyst Training",
    "AWS Academy Cloud Foundations Learner",
  ],
};

export const experience = [
  {
    company: "OneForma",
    role: "Data Annotator",
    type: "Remote Contract",
    period: "Apr 2025 – Present",
    current: true,
    tag: "LIGHTHOUSE",
    color: "lilac",
    points: [
      "Deliver text, image, and preference-ranking annotations for the Lighthouse evaluation project, applying formal client guidelines to strengthen model training outcomes.",
      "Review image–text pairs for semantic and visual alignment, catching mismatches before they reach downstream training pipelines.",
      "Sustain annotation accuracy through recurring guideline revisions and internal quality audits, adapting quickly to shifting evaluation standards.",
    ],
  },
  {
    company: "OneForma",
    role: "Natural Language Annotator",
    type: "Remote Contract",
    period: "Sep 2026",
    tag: "FRED · LIGHTHOUSE",
    color: "mint",
    points: [
      "Annotate Indonesian-language user utterances for the Fred project, converting natural language input into structured intent representations.",
      "Write golden responses and rubric-based evaluations that set the accuracy benchmark for AI-generated outputs.",
      "Build intent-annotation frameworks tuned to Indonesian language patterns, reinforcing system reliability at the source.",
    ],
  },
  {
    company: "RWS",
    role: "AI Language Annotator",
    type: "Remote Contract",
    period: "Jul 2026 – Aug 2026",
    tag: "ECHO",
    color: "sky",
    points: [
      "Delivered text annotation, image annotation, and preference-ranking evaluations across the Lighthouse and Opal projects, supporting two concurrent workstreams.",
      "Conducted image curation and cross-modal alignment reviews, confirming exact matches between visual and textual components before dataset submission.",
      "Partnered with evaluation teams under formal written guidelines to meet client accuracy and data-quality standards.",
    ],
  },
  {
    company: "Vriddhi Agency",
    role: "Administrative Intern",
    type: "Remote · Malang, East Java",
    period: "Feb 2025 – Apr 2025",
    tag: "OUTREACH",
    color: "peach",
    points: [
      "Researched 10+ target companies daily and launched targeted email outreach pitching web design solutions, managing contact tracking within strict 3-hour daily deadlines.",
    ],
  },
  {
    company: "BTPN Syariah",
    role: "Co-Facilitator Intern",
    type: "On-site · Pacitan, East Java",
    period: "Oct 2024 – Jan 2025",
    tag: "SME · DIGITAL LITERACY",
    color: "butter",
    points: [
      "Facilitated workshops and field mentoring for 10+ small and medium enterprises on business fundamentals and digital literacy, earning a 71.3/100 average client competency rating.",
    ],
  },
  {
    company: "GAOTek Inc",
    role: "Digital Marketing Intern, Market Report Team",
    type: "Remote · New York, USA",
    period: "Apr 2024 – Aug 2024",
    tag: "SEO · MARKET INTEL",
    color: "lilac",
    points: [
      "Conducted SEO-driven market research and built structured data assets in Excel, delivering 15+ market intelligence reports monthly and presenting findings in weekly video calls.",
    ],
  },
];

export const skills = {
  "AI Data Annotation & Evaluation": [
    "Text / image annotation", "Preference ranking", "Rubric-based evaluation",
    "Golden response writing", "Cross-modal alignment review", "Quality benchmarking",
  ],
  "Programming & Web": ["HTML5", "CSS3", "JavaScript", "React"],
  "Data & Analysis": ["SQL", "Google BigQuery", "Microsoft Excel"],
  "Design": ["Figma", "UI/UX design", "Wireframing", "Prototyping"],
};

export const certifications = [
  {
    title: "UI/UX Designer Mini Course",
    issuer: "Belajar Bekerja (Luar Sekolah)",
    year: 2024,
    blurb: "Four-day UX training in user research, wireframing, and Figma prototyping, capped by a capstone presentation.",
  },
  {
    title: "Responsive Web Design",
    issuer: "freeCodeCamp",
    year: 2024,
    blurb: "300+ hours of certified coursework in HTML, CSS, and responsive design for mobile-friendly web apps.",
  },
  {
    title: "Data Series 11.0 & Product Series 3.0",
    issuer: "Dibimbing.id",
    year: 2024,
    blurb: "Analyzed the Chicago Taxi Trips dataset in SQL and BigQuery, then built a restaurant-ordering app prototype tested for usability.",
    project: true,
  },
  {
    title: "Comprehensive Coding Camp",
    issuer: "Dicoding Indonesia",
    year: 2024,
    blurb: "Certifications in front-end development, JavaScript, React, SQL, and Python fundamentals.",
  },
];

export const languages = [
  { name: "Bahasa Indonesia", level: "Native", fill: 100 },
  { name: "English", level: "Professional", fill: 85 },
  { name: "Bahasa Melayu", level: "Conversational", fill: 60 },
];
```

---

## 6. Global Effects and Providers

### 6.1 `lib/gsap.ts`: register plugins once

```ts
"use client";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { DrawSVGPlugin } from "gsap/DrawSVGPlugin";
import { MorphSVGPlugin } from "gsap/MorphSVGPlugin";
import { Flip } from "gsap/Flip";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(useGSAP, ScrollTrigger, SplitText, DrawSVGPlugin, MorphSVGPlugin, Flip);
export { gsap, ScrollTrigger, SplitText, Flip, useGSAP };
```

### 6.2 `components/providers/SmoothScroll.tsx`: Lenis + GSAP in one ticker

```tsx
"use client";
import { ReactLenis, type LenisRef } from "lenis/react";
import { useEffect, useRef } from "react";
import "lenis/dist/lenis.css";
import { gsap, ScrollTrigger } from "@/lib/gsap";

export function SmoothScroll({ children }: { children: React.ReactNode }) {
  const lenisRef = useRef<LenisRef>(null);

  useEffect(() => {
    const update = (time: number) => lenisRef.current?.lenis?.raf(time * 1000);
    gsap.ticker.add(update);
    gsap.ticker.lagSmoothing(0);
    lenisRef.current?.lenis?.on("scroll", ScrollTrigger.update);
    return () => gsap.ticker.remove(update);
  }, []);

  return (
    <ReactLenis root ref={lenisRef} options={{ autoRaf: false, lerp: 0.09, smoothWheel: true }}>
      {children}
    </ReactLenis>
  );
}
```

### 6.3 Aurora Background (`fx/AuroraBackground.tsx`)

- 4 huge blurred blobs (`lilac`, `peach`, `mint`, `sky`), each `w-[50vw] aspect-square rounded-full blur-[120px] opacity-40`, fixed behind everything.
- Each blob drifts on its own looping GSAP timeline (random `x/y/scale`, 18–30s, `yoyo`, `sine.inOut`).
- The blobs **parallax slightly toward the cursor** using Motion `useSpring` on pointer position (stiffness 40, damping 20).
- Section change → blobs **re-tint** (ScrollTrigger `onEnter` tweens their `backgroundColor` to the section's accent).

### 6.4 Grain Overlay

A fixed full-screen `<svg>` with `<feTurbulence baseFrequency="0.8" numOctaves="3" />`, `mix-blend-mode: overlay`, `opacity: 0.06`, `pointer-events: none`.

### 6.5 Custom Cursor (`fx/CustomCursor.tsx`)

- **Two layers:** a 10px solid lilac dot (instant) and a 40px glass ring (spring-follows with Motion `useSpring`, stiffness 300, damping 28).
- **Context states** via `data-cursor` attributes:
  - `data-cursor="link"` → ring scales to 64px and inverts with `mix-blend-difference`
  - `data-cursor="view"` → ring becomes a pill reading `VIEW ↗`
  - `data-cursor="drag"` → ring shows `⟷ DRAG` (used in RankMe and the pipeline)
  - `data-cursor="annotate"` → ring becomes a **dashed square with a crosshair**, as if you're about to draw a bounding box
- Hide on touch devices (`(pointer: coarse)`).

### 6.6 Magnetic Wrapper (`fx/Magnetic.tsx`)

```tsx
"use client";
import { motion, useMotionValue, useSpring } from "motion/react";
import { useRef } from "react";

export function Magnetic({ children, strength = 0.35 }: { children: React.ReactNode; strength?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const x = useSpring(useMotionValue(0), { stiffness: 220, damping: 15, mass: 0.4 });
  const y = useSpring(useMotionValue(0), { stiffness: 220, damping: 15, mass: 0.4 });

  return (
    <motion.div
      ref={ref}
      style={{ x, y }}
      onPointerMove={(e) => {
        const r = ref.current!.getBoundingClientRect();
        x.set((e.clientX - (r.left + r.width / 2)) * strength);
        y.set((e.clientY - (r.top + r.height / 2)) * strength);
      }}
      onPointerLeave={() => { x.set(0); y.set(0); }}
    >
      {children}
    </motion.div>
  );
}
```

Wrap every CTA button, nav pill and social icon in it.

### 6.7 Signature Component: `fx/AnnotationBox.tsx`

The dashed, rounded bounding box that **draws itself** around any child when it scrolls into view.

**Behaviour**
1. An absolutely-positioned SVG `<rect rx="20">` sits around the child, sized with a `ResizeObserver`.
2. On enter (ScrollTrigger `start: "top 75%"`): `DrawSVGPlugin` animates the stroke `0% → 100%` (0.9s, `power2.inOut`).
3. The stroke then switches to `stroke-dasharray: 8 6` with `animation: var(--animate-dash)` (the "marching ants" of a selection).
4. **Four corner handles** (8px rounded squares) pop in with a staggered spring scale `0 → 1`.
5. A **label chip** slides down from the top-left corner: mono font, tiny, colored background, e.g. `LABEL: HUMAN · CONF 0.99`.
6. On hover the confidence number **scrambles** (GSAP ScrambleText) and lands on a new value.

```tsx
<AnnotationBox label="human" confidence={0.99} color="lilac">
  <h1>Rasendriya</h1>
</AnnotationBox>
```

### 6.8 `fx/SplitReveal.tsx`

GSAP `SplitText.create(el, { type: "lines,words,chars", mask: "lines" })`, then:
- **Default:** chars rise from `yPercent: 110` with `rotate: 8`, stagger `0.018`, `expo.out`
- **Variant `"blur"`:** words go from `filter: blur(12px), opacity: 0` to sharp
- **Variant `"scramble"`:** for mono labels
- Always `split.revert()` on cleanup (`useGSAP` handles this automatically when created inside it).

### 6.9 Preloader (`fx/Preloader.tsx`)

1. Full-screen ink panel. A counter `000 → 100` in huge mono type, displayed as `ANNOTATING… 047%`.
2. Under it, a tiny progress pill fills with the aurora gradient.
3. At 100: the panel **splits into 5 rounded vertical glass slats** that slide up in a stagger (`expo.inOut`), revealing the hero.
4. The hero's `SplitReveal` fires as the last slat leaves.
5. Only show it **once per session** (`sessionStorage` flag, wrapped in try/catch).

---

## 7. Sections (top to bottom)

### 7.1 `Nav`

- A floating **glass pill** centered at the top (`fixed top-5 left-1/2 -translate-x-1/2 rounded-full glass px-2 py-2`).
- Links: `About · Work · Skills · Certs · Contact`. The active link has a **sliding lilac blob** behind it (Motion `layoutId="nav-pill"`).
- Scroll down → the pill shrinks to icons only and a small "RK" monogram. Scroll up → it expands again (Motion `useScroll` + `useMotionValueEvent`).
- Right side: a **"Hire me" button** with a mint pulsing dot (`● Available for work`).
- Mobile: a round menu button **morphs** (MorphSVG) from ☰ to ✕, and a full-screen glass sheet slides in with link letters staggering up.

### 7.2 `Hero`

**Layout:** full viewport. Name huge on the left, 3D glass blob on the right, floating chips around it.

**Elements and animation**
1. **Eyebrow pill:** `👋 Halo! I'm` in a small glass pill that floats (`animate-float`).
2. **Name:** `Rasendriya` in Bricolage at `clamp(4rem, 14vw, 13rem)`, wrapped in `<AnnotationBox label="human" confidence={0.99}>`. Chars reveal with SplitReveal. On hover, each letter's `font-variation-settings: "wght"` swells from 400 to 800 based on cursor distance (variable-font proximity effect).
3. **Rotating role line:** "AI Data Annotator / Language Evaluator / Front-End Developer / UI/UX Enthusiast". Each word swaps with a vertical **slot-machine roll** (Motion `AnimatePresence` + `y` spring) every 2.4s. The current word is in `text-aurora`.
4. **Headline:** *"I teach machines to **see**, **read**, and **respond**, then build the interfaces humans actually touch."* "see", "read" and "respond" are Instrument Serif italic, each in a different accent color.
5. **3D Glass Blob (`three/GlassBlob.tsx`):**
   - R3F `<Canvas dpr={[1, 2]}>` with a `<mesh>` of `icosahedronGeometry args={[1.4, 64]}`.
   - Drei `<MeshTransmissionMaterial transmission={1} thickness={0.6} roughness={0.05} chromaticAberration={0.25} ior={1.3} distortion={0.4} distortionScale={0.5} temporalDistortion={0.15} />`
   - Vertices wobble with a simplex-noise displacement in `onBeforeCompile` (or Drei `MeshDistortMaterial` as a simpler fallback).
   - Behind the blob: three tiny emissive shapes (a rounded cube, a torus, a capsule) in lilac/peach/mint that refract through the glass.
   - Blob **tilts toward the cursor** (`useFrame` lerp to pointer) and **squishes** on click (scale spring 1 → 0.85 → 1).
   - Loaded via `next/dynamic` with `ssr: false` and a CSS gradient-orb fallback while loading.
6. **Floating annotation chips** orbit the blob at different depths: `#frontend`, `#rubric_eval`, `#golden_response`, `#figma`, `#react`, `#bahasa_ID`. Each one floats on its own sine path and is **draggable** (Motion `drag` with `dragElastic={0.6}` and `dragSnapToOrigin`).
7. **CTAs:** `[ See my work ↓ ]` (peach, filled) and `[ Download CV ]` (glass), both Magnetic.
8. **Scroll cue:** a rounded mouse outline with a dot that scrolls down on loop, plus the text `SCROLL TO ANNOTATE`.

**Scroll-out:** as the hero leaves, the name scales to 0.85, blurs to 6px and fades. The blob drifts up and right with a 0.4 parallax factor (ScrollTrigger `scrub: true`).

### 7.3 `Marquee` (between Hero and About)

Two infinite marquee rows going opposite directions, both slightly rotated (`-2deg` / `+2deg`), in glass ribbons:
- Row 1: `TEXT ANNOTATION ✦ IMAGE ANNOTATION ✦ PREFERENCE RANKING ✦ GOLDEN RESPONSES ✦ CROSS-MODAL ALIGNMENT ✦`
- Row 2: `HTML5 ✦ CSS3 ✦ JAVASCRIPT ✦ REACT ✦ SQL ✦ BIGQUERY ✦ FIGMA ✦`

Scroll speed modulates the marquee speed (scroll velocity from Lenis → `timeScale`), and it reverses direction when you scroll up.

### 7.4 `About`

**Layout:** a bento grid of glass cards (12-col desktop, stacked on mobile).

| Card | Content | Animation |
|---|---|---|
| **Portrait** (tall) | Photo in a `rounded-[40px]` mask | Photo inside `AnnotationBox label="rasendriya" confidence={1.00}`. Image starts as a **pixelated mosaic** (CSS `image-rendering: pixelated` on a tiny version), then "de-pixelates" into the full image, like a model getting clearer |
| **Summary** (wide) | The summary paragraph | Words reveal by **scroll-scrubbed opacity**: each word goes from 15% to 100% opacity as you scroll through it |
| **Stats** (4 mini cards) | `1+ yr`, `6 roles`, `300+ hrs`, `3.51 GPA` | Numbers count up (Motion `animate()` on enter) with a little spring overshoot. Each card tilts in 3D on hover (`rotateX/rotateY` from pointer, max 10°) |
| **Education** | Siber Muhammadiyah University, CS, 2022–Present, extras | Badge stickers (Red Hat, Blue Team, AWS) that **peel** on hover (CSS 3D fold of the corner) |
| **Location** | "Pacitan, East Java 🇮🇩" | A mini stylized map with a pulsing mint pin and the **current local time in WIB** ticking |

### 7.5 `RankMe`: interactive preference ranking ⭐ signature moment

A playful nod to the preference-ranking work.

- Title: *"Rank what I'm best at"* + mono sub-label `TASK: PREFERENCE_RANKING · ANNOTATOR: YOU`.
- 4 glass cards in a vertical **Reorder list** (Motion `Reorder.Group` / `Reorder.Item`):
  1. "Catching image–text mismatches"
  2. "Writing golden responses"
  3. "Building responsive React UIs"
  4. "Explaining things in Bahasa & English"
- Dragging lifts the card (`scale 1.04`, bigger shadow, slight rotate) and the others make room with springs.
- A **"Submit ranking"** button. On click, confetti made of tiny rounded squares in palette colors bursts out. Then the cards **flip** (3D `rotateY 180°`) to reveal: *"Thanks, annotator! Every option is ranked #1 here 😄"*, and a mint `✓ APPROVED BY QA` stamp **slams in** (scale 2 → 1, rotate -12°, with a small screen shake).

### 7.6 `Experience`: "The Pipeline"

**Desktop:** a horizontally scrolling pinned section.

- ScrollTrigger pins the section; vertical scroll drives `x` translation of a track of 6 experience cards (`scrub: 1`, `end: () => "+=" + track.scrollWidth`).
- Cards are connected by a **flowing gradient SVG path** (DrawSVG scrubbed with scroll). Little glowing "data packets" (dots) travel along the path using MotionPath.
- Each card is a big glass panel (`w-[min(80vw,560px)] rounded-[32px]`):
  - Top: company name, role, period, and an `AnnotationBox`-style tag chip (`LIGHTHOUSE`, `FRED · ID-LANG`, `LIGHTHOUSE · OPAL`, and so on) colored per item.
  - "**● CURRENT**" mint pulsing pill on the OneForma Data Annotator card.
  - Bullet points reveal line by line as the card reaches the center.
  - The active (centered) card scales to 1, while neighbors sit at 0.92 with 60% opacity.
- A progress bar at the bottom shows `03 / 06` with a rolling number.

**Mobile:** a vertical timeline with the gradient line drawing down as you scroll and cards sliding in from alternating sides.

**Card click → detail:** opens a glass modal using a **React 19.3 View Transition** (`<ViewTransition name={`exp-${i}`}>` on both the card and modal header) so the card **morphs** into the modal.

### 7.7 `Skills`: "Cross-Modal Alignment"

**Layout:** two columns. **Left:** a grid of rounded glass icon tiles (HTML5, CSS3, JS, React, SQL, BigQuery, Excel, Figma, plus custom icons for annotation skills). **Right:** the skill names as a list grouped by the 4 categories.

**Interaction ⭐**
- Hover an icon → an animated **SVG bezier line** draws from the icon to its matching text label (DrawSVG, 0.4s). Both glow, and a chip appears mid-line: `ALIGNED ✓`.
- Hover a wrong pair on purpose (e.g. "Easter egg mode" toggle) → the line turns peach and wobbles: `MISMATCH ✗`, a joke about her image–text QA work.
- **Category filter pills** at the top (`All · Annotation · Web · Data · Design`). Clicking one rearranges the tiles with **GSAP Flip** (smooth reflow, non-matching tiles shrink and fade).
- Each tile has a slow idle float and tilts on hover.

### 7.8 `Certifications`

- A **fanned stack of 4 rounded glass "certificate cards"**, like a hand of playing cards.
- On scroll into view they **fan out** (GSAP: rotate -12° / -4° / 4° / 12°, spread x).
- Hover a card → it lifts and straightens, others dim. Click → it **flips** to show the blurb on the back.
- The Dibimbing.id card has an extra **"PROJECT"** sticker and its back shows two mini sections: *Chicago Taxi Trips analysis (SQL + BigQuery)* and *Restaurant-ordering app prototype*.
- Each card has an animated **holographic foil** sheen (conic gradient moving with the cursor).

### 7.9 `Languages`

Three rounded glass pills with liquid fill bars:
- Each bar fills like **liquid** (SVG wave path animated horizontally + height tween to `fill%`) in its accent color.
- Hover a pill → it says "Hello" in that language with a typewriter effect: **"Halo!"**, **"Hello!"**, **"Helo!"**

### 7.10 `Contact`: "The Golden Response"

- Big heading: *"Let's write something **golden** together."* with "golden" in Instrument Serif italic, butter color, shimmering.
- A large glass panel with the **`border-golden`** utility. The `--angle` custom property rotates 360° on loop, so the gold border light orbits the card.
- Styled as an annotation tool's response editor:
  - Header bar: `● ● ●` dots + `golden_response.md` + mono chip `RUBRIC: 5/5`
  - A fake text area where a message **types itself** on enter: *"Hi Rasendriya, I'd love to work with you on…"* with a blinking caret.
  - Buttons: `✉ rasuen27@gmail.com` (click → copies to clipboard + toast "Copied ✓"), `in LinkedIn`, `↗ Old portfolio`.
- Optional real form (name, email, message) via a **Server Action** + Resend/Formspree. Its submit button **morphs** into a checkmark (MorphSVG) on success.
- Behind it, the aurora blobs **gather into a warm gold-peach glow**.

### 7.11 `Footer`

- Giant outlined text `RASEND` spanning full width. As you scroll in, the outline **fills from left to right** with the aurora gradient (clip-path scrubbed).
- Small row: `© 2026 Rasendriya Khansa Jolankarfyan · Built with Next.js 16 & a lot of springs · Pacitan, ID`
- A **"Back to top"** round glass button. Click → `lenis.scrollTo(0, { duration: 2, easing: expo })` while the button rotates 360°.
- Easter egg: typing `qa` anywhere drops dashed AnnotationBoxes on every element on the page with random labels for 5 seconds.

---

## 8. Extra Delight (sprinkle across the site)

- **Section transitions:** each section's top edge is a soft SVG wave that morphs (MorphSVG) as it enters.
- **Image hovers:** a liquid ripple distortion via an SVG `feDisplacementMap` filter whose scale tweens on hover.
- **Buttons:** fill sweeps from the cursor's entry point (circle clip-path from pointer coordinates), and the label text rolls up and is replaced by an identical copy.
- **Link underline:** a squiggly SVG underline that draws in on hover.
- **Scroll progress:** a thin aurora gradient line at the very top of the viewport (Motion `useScroll().scrollYProgress` → `scaleX`).
- **Tab title:** when the user leaves the tab, `document.title` becomes `"👀 come back, the annotation isn't done!"`
- **Console greeting:** a styled `console.log` with a small ASCII "RK" and a hiring note for devs who open DevTools.
- **404 page:** a big glass card stamped `✗ REJECTED BY QA: page not found` and a button `Re-annotate → Home`.

---

## 9. Performance Budget

| Metric | Target |
|---|---|
| LCP | < 2.0s |
| CLS | < 0.05 |
| INP | < 150ms |
| JS (first load) | < 180 KB gz |

**Rules**
- 3D canvas: `next/dynamic(() => import(...), { ssr: false })`, rendered only when in view (`frameloop="demand"` when off-screen), `dpr={[1, 1.75]}`. Fall back to a static gradient orb on low-end devices (`navigator.hardwareConcurrency <= 4`) or `prefers-reduced-motion`.
- Motion: in Server Component trees, import from `motion/react-client`. Use `LazyMotion` + `m` for small widgets.
- GSAP plugins are only imported inside client components that use them.
- Images: `next/image` with AVIF, `sizes` set, portrait `priority`.
- Fonts: `next/font` with `display: "swap"` and only the needed weights/axes.
- Backdrop blur is expensive: keep glass layers under about 8 visible at once, and use `will-change: transform` only during animation.
- Run the **Turbopack Bundle Analyzer** before launch (Next 16.4) and trim any heavy route.

---

## 10. Accessibility

- **`prefers-reduced-motion`:** Lenis already disables smoothing. Also skip the preloader, replace SplitText reveals with simple fades, freeze the 3D blob, and stop the marquees.
- All interactive gimmicks (RankMe, skill alignment, certificate flips) must work with a **keyboard** (Motion Reorder + arrow-key fallback buttons) and have visible lilac focus rings (`focus-visible:ring-2 ring-lilac ring-offset-2 ring-offset-ink`).
- Text contrast on glass ≥ 4.5:1. Add a darker scrim behind text if the aurora makes it too bright.
- The custom cursor is decorative: never hide the native cursor on inputs, and keep `aria-hidden` on it.
- Decorative SVGs get `aria-hidden="true"`. AnnotationBox labels are visual only (`aria-hidden`), so the real heading text stays readable.
- `lang="en"` on `<html>`. Optionally add an ID/EN language toggle later.

---

## 11. SEO and Metadata (`app/layout.tsx`)

```tsx
import type { Metadata } from "next";
import { Bricolage_Grotesque, Geist, Geist_Mono, Instrument_Serif } from "next/font/google";

const bricolage = Bricolage_Grotesque({ subsets: ["latin"], variable: "--font-bricolage", axes: ["opsz"] });
const geist = Geist({ subsets: ["latin"], variable: "--font-geist" });
const geistMono = Geist_Mono({ subsets: ["latin"], variable: "--font-geist-mono" });
const instrument = Instrument_Serif({ subsets: ["latin"], weight: "400", style: "italic", variable: "--font-instrument" });

export const ensureStatic = "navigation";

export const metadata: Metadata = {
  metadataBase: new URL("https://rasend-portfolio.vercel.app"),
  title: {
    default: "Rasendriya Khansa: AI Data Annotator & Front-End Developer",
    template: "%s · Rasendriya Khansa",
  },
  description:
    "Final-year Computer Science student from Indonesia specializing in AI data annotation, language evaluation, golden-response writing, and React front-end development.",
  keywords: ["Rasendriya Khansa", "AI data annotator", "language evaluator", "front-end developer", "React", "Indonesia", "portfolio"],
  openGraph: { type: "website", locale: "en_US", siteName: "Rasendriya Khansa" },
  twitter: { card: "summary_large_image" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${bricolage.variable} ${geist.variable} ${geistMono.variable} ${instrument.variable}`}>
      <body className="font-sans antialiased bg-ink text-cloud">
        {/* <Preloader /> <AuroraBackground /> <GrainOverlay /> <CustomCursor /> */}
        {/* <SmoothScroll><Nav />{children}</SmoothScroll> */}
        {children}
      </body>
    </html>
  );
}
```

Also add:
- **JSON-LD `Person` schema** (name, jobTitle, alumniOf, address: Pacitan, sameAs: LinkedIn).
- `app/opengraph-image.tsx`: a 1200×630 image with the aurora background, a glass card, "Rasendriya Khansa" in Bricolage, and an annotation box around the name.
- `app/sitemap.ts` and `app/robots.ts`.

---

## 12. Build Order (suggested sprints)

1. **Foundation:** create the app, tokens in `globals.css`, fonts, `content/profile.ts`, `cn()`, `lib/gsap.ts`.
2. **Atmosphere:** AuroraBackground, GrainOverlay, SmoothScroll provider, GlassCard, Button, Pill.
3. **Signature pieces:** AnnotationBox, SplitReveal, Magnetic, CustomCursor.
4. **Hero:** layout, role roller, chips, then GlassBlob (3D) last.
5. **Story sections:** Marquee → About (bento) → RankMe → Experience pipeline.
6. **Showcase:** Skills alignment → Certifications fan → Languages.
7. **Close:** Contact golden response → Footer → Nav polish → Preloader.
8. **Delight pass:** button fills, underline squiggles, tab title, console greeting, easter egg, 404.
9. **Hardening:** reduced motion, keyboard paths, contrast check, Lighthouse, bundle analyzer, mobile QA on a real phone.
10. **Ship:** push to GitHub → import in Vercel → point `rasend-portfolio.vercel.app` (or a custom domain) at it.

---

## 13. Before You Launch: Checklist

- [ ] Add a real portrait to `public/rasendriya.webp` and the CV to `public/cv.pdf`
- [ ] Cross-check `content/profile.ts` against the LinkedIn profile (add GitHub, extra projects, recommendations)
- [ ] Double-check dates (e.g., the Sept 2026 Natural Language Annotator role) match LinkedIn exactly
- [ ] Decide whether to show the phone number publicly (it isn't included above, which is the safer default)
- [ ] Test with `prefers-reduced-motion` on
- [ ] Test keyboard-only navigation through RankMe, Skills and Certificates
- [ ] Lighthouse ≥ 90 on Performance, 100 on Accessibility/SEO/Best Practices
- [ ] Test Safari (backdrop-filter, `@property`), Chrome, Firefox, iOS and Android
- [ ] `npm run build` passes with `ensureStatic = "navigation"`
- [ ] Keep Next.js patched (`npm install next@latest`). Monthly security releases are now the norm.
