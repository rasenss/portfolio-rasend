# How to add things to the site

Certificates, design work and jobs come straight from folders. To add one, put a file in
the right folder. You don't touch any code, and the layout adjusts by itself: new rows,
new tiles, new years and new filter buttons appear on their own.

While `npm run dev` is running, save the file and **reload the page** to see it.
For the live site, push to GitHub as usual (`git add .`, `git commit -m "…"`, `git push`).

---

## 1. A new certificate → `public/certificates/`

Drop the certificate in. It can be a **PDF** or a picture (**PNG, JPG, WebP**).
Name the file like this:

```
YEAR - Issuer - Title.pdf
```

Examples:

```
2027 - Dicoding Indonesia - Machine Learning for Beginners.pdf
2027-05 - Google - UX Design Certificate.png
```

- Adding the month (`2027-05`) is optional. It puts certificates from the same year in date order.
- The list sorts itself: newest year first, then A to Z.
- **PDF and picture together:** give them the same name, for example `… Title.pdf` and `… Title.png`.
  The picture is shown, and visitors also get an "Open PDF" button.
- **PDF only:** that's fine too. It's shown in the viewer, or as a neat "PDF" card where a
  browser can't show PDFs.

**Optional extras:** add a text file with the **same name** ending in `.txt`, for example
`2027 - Dicoding Indonesia - Machine Learning for Beginners.txt`:

```
verify: https://www.dicoding.com/certificates/XXXXXXX
covers: Machine learning, Python, Model evaluation
```

`verify` adds the "Verify with …" button. `covers` adds the topic tags (separate them with commas).

---

## 2. A new design piece → `public/work/`

Drop the image in (PNG, JPG, WebP). Name it:

```
Kind - Title.png
```

Examples:

```
App design - Food delivery app.png
Posters - Campus seminar 2027.jpg
Logos - Coffee shop mark.png
```

- **Kind** becomes the filter button. Use an existing one (App design, Posters, LinkedIn posts, Logos)
  or make up a new one, like `Illustrations - …`. A new kind gets its own button and colour automatically.
- Kinds containing "logo", "icon", "brand" or "emblem" sit on white and are never cropped.
- **Order:** new pieces without a number show first. To put one in a fixed spot, start the name
  with a number: `05 - Posters - Title.png` (the existing pieces are numbered 01–12).
- The image's shape is read automatically, so the grid always fits it.

**Optional extras** (same name, `.txt`):

```
description: A food delivery app with live order tracking, designed in Figma.
link: Open in Figma | https://www.figma.com/file/...
```

You can leave out the button text (`link: https://...`). Figma, LinkedIn, Behance and Dribbble
links get a fitting label by themselves.

---

## 3. A new job → `content/experience/`

Add one text file per job (`.md` or `.txt`, any name, for example `2027-01 Company - Role.md`):

```
company: Company Name
role: Your Role
type: Remote contract
start: 2027-01
end: now
project: Project name

- What you did, one line per point.
- Another point.
```

- `start` and `end` are year-month, like `2027-01`.
- `end: now` (or leaving `end` empty) means you still work there, so it shows under **NOW** at the top.
- When the job ends, change `end: now` to the real month, like `end: 2027-06`. It moves into its year by itself.
- The dates line ("Jan 2027 – now", "Jul – Aug 2026", …) is written for you.
- `type` and `project` are optional.
- A job missing `company`, `role` or `start` is skipped, and the terminal tells you which file.

---

## Removing or changing something

- **Remove:** delete the file (and its `.txt`, if it has one).
- **Rename or move to another year:** rename the file.
- **Hide without deleting:** start the file name with `_` (for example `_2027 - …pdf`).

## Everything else

Your name, the intro paragraph, About text, skills, languages and the Latin quotes are in
`content/profile.ts`. It's one plain list of text you can edit in VS Code.
