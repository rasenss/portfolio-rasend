/**
 * The site's public address, used for link previews, Google (sitemap/robots) and the
 * "share this site" button. On Vercel it's picked up automatically from your project's
 * main domain, so it stays right even if the domain changes. Set NEXT_PUBLIC_SITE_URL
 * in Vercel to force a specific address (for example a custom domain).
 */
const fromEnv =
  process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : "") ||
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "");

export const SITE_URL = (fromEnv || "http://localhost:3000").replace(/\/+$/, "");

/** true only when built on Vercel, where Vercel's own analytics scripts exist */
export const ON_VERCEL = process.env.VERCEL === "1";
