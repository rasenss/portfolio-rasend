import type { Metadata, Viewport } from "next";
import { Archivo } from "next/font/google";
import "./globals.css";
import { SmoothScroll } from "@/components/providers/SmoothScroll";
import { Delight } from "@/components/fx/Delight";
import Script from "next/script";
import { ON_VERCEL, SITE_URL } from "@/lib/site";

// One family for everything. Archivo's weight (100–900) and width (62–125) axes
// give both the condensed display cut and the hero name effect.
const archivo = Archivo({ subsets: ["latin"], variable: "--font-archivo", display: "swap", axes: ["wdth"] });

// Next.js 16.4: guarantee every navigation is fully static
export const ensureStatic = "navigation";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Rasend-Site",
    template: "%s | Rasendriya Khansa Jolankarfyan",
  },
  description:
    "Final-year Computer Science student at Siber Muhammadiyah University working as an AI data annotator (text annotation, image annotation and rubric-based evaluation) and designing interfaces as a UI/UX designer in Figma.",
  keywords: ["Rasendriya Khansa", "AI data annotator", "text annotation", "image annotation", "rubric-based evaluation", "UI/UX designer", "Figma", "Siber Muhammadiyah University", "Indonesia", "portfolio"],
  authors: [{ name: "Rasendriya Khansa Jolankarfyan" }],
  openGraph: { type: "website", locale: "en_US", siteName: "Rasendriya Khansa", url: SITE_URL },
  twitter: { card: "summary_large_image" },
};

export const viewport: Viewport = {
  themeColor: "#23282D",
  colorScheme: "dark",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={archivo.variable}>
      <body className="bg-base font-sans text-fg antialiased">
        <div aria-hidden className="scroll-progress fixed inset-x-0 top-0 z-[70] h-[3px] origin-left bg-role" />
        <a href="#about" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[200] focus:rounded-full focus:bg-role focus:px-4 focus:py-2 focus:text-on">
          Skip to content
        </a>
        <SmoothScroll>
          {children}
          <Delight />
        </SmoothScroll>
        {/* Visitor counts and real-device speed in your Vercel dashboard (Analytics and Speed
            Insights tabs). Cookie-free, and only added on Vercel, where these scripts exist. */}
        {ON_VERCEL && (
          <>
            <Script id="va-init" strategy="afterInteractive">
              {"window.va=window.va||function(){(window.vaq=window.vaq||[]).push(arguments)};window.si=window.si||function(){(window.siq=window.siq||[]).push(arguments)};"}
            </Script>
            <Script src="/_vercel/insights/script.js" strategy="afterInteractive" />
            <Script src="/_vercel/speed-insights/script.js" strategy="afterInteractive" />
          </>
        )}
      </body>
    </html>
  );
}
