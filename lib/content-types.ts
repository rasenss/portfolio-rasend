/* Shapes of the things the site reads from your folders (see "HOW TO ADD CONTENT.md").
   Kept separate from the folder reader so the browser-side code can use them too. */

export type Certification = {
  /** unique: the file name it came from */
  id: string;
  title: string;
  issuer: string;
  /** null when the file name has no year */
  year: number | null;
  /** picture of the certificate (png, jpg, webp…), if there is one */
  image: string | null;
  /** the PDF, if there is one */
  pdf: string | null;
  /** width / height of the picture or the PDF's first page */
  ratio: number;
  verify?: string;
  covers: string[];
};

export type Project = {
  id: string;
  title: string;
  kind: string;
  image: string;
  /** width / height of the image, so the grid reserves the right space */
  ratio: number;
  description: string;
  link?: { label: string; href: string };
};

export type Experience = {
  id: string;
  company: string;
  role: string;
  type: string;
  /** shown text, e.g. "Apr 2025 – now" (worked out from start and end) */
  period: string;
  /** "YYYY-MM" */
  start: string;
  /** "YYYY-MM", or "" while still working there */
  end: string;
  current: boolean;
  project?: string;
  points: string[];
};
