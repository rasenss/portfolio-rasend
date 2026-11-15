# Rasendriya Khansa: Portfolio

A one-page portfolio built with **Next.js 16.4**, **React 19.3**, **Tailwind CSS v4**, **Motion**, **GSAP** and **Lenis**.

The design borrows from the tools Rasendriya works in every day: text is marked up the way an entity-annotation tool marks it, with flat highlighter colours for each label class, and the name sits inside an object-detection bounding box.

## Run it

```bash
npm install
npm run dev
```

Open http://localhost:3000. To check it on your phone, open `http://<your-mac's-ip>:3000`; the address must be listed in `allowedDevOrigins` in `next.config.ts` (192.168.x.x is already allowed).

## Edit the content

Every word on the site lives in **`content/profile.ts`**.

- **Hero paragraph:** `intro` is a list of plain strings and `{ text, type }` entities. The type picks the highlighter colour (person, role, org, place, skill).
- **Photo:** save a portrait as `public/rasendriya.webp`, then set `portrait: "/rasendriya.webp"`.
- **CV:** `public/cv.pdf` is the file behind "Download CV".
- **GitHub:** set `links.github` to add a GitHub link in Contact.

## Design tokens ("field kit")

| Token | Hex | Use |
|---|---|---|
| base | `#23282D` | page background (gunmetal) |
| surface | `#2C3238` | cards and inputs |
| line | `#414950` | borders |
| fg | `#ECE7DC` | text (bone) |
| fg-soft | `#A8ADA6` | secondary text |
| on | `#1A1E22` | text placed on a highlighter colour |
| person | `#8DB0CC` | steel |
| role | `#E3A43A` | amber, the main accent |
| org | `#D4C39B` | sand |
| place | `#A9B46A` | olive |
| skill | `#74B8AC` | teal |

Typeface: Archivo (one family). Headings use its condensed width; the hero name widens near the cursor using the width axis. No gradients.

## Motion rules

- The intro (name, bounding box, scan line, highlights) is pure CSS, so it plays even before JavaScript loads.
- Scroll reveals use CSS scroll-driven animations and only run in browsers that support them; elsewhere content is simply shown. Each reveal finishes when the element is fully on screen, so nothing can stop half-way.
- Everything respects the system "reduce motion" setting.

## Cleanup

The files in `components/three/`, plus `AuroraBackground`, `GrainOverlay`, `CustomCursor`, `Magnetic`, `Marquee`, `Preloader`, `ScrollProgress`, `SplitReveal`, `sections/Languages.tsx` and `lib/ready.ts`, are left over from the first version. They are empty now and safe to delete.

## Deploy

Push to GitHub, then import the repo at https://vercel.com/new.
