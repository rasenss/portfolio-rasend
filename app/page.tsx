import { education, profile } from "@/content/profile";
import { getCertificates, getExperience, getProjects } from "@/lib/content";
import { Nav } from "@/components/sections/Nav";
import { Hero } from "@/components/sections/Hero";
import { About } from "@/components/sections/About";
import { Experience } from "@/components/sections/Experience";
import { Skills } from "@/components/sections/Skills";
import { Certifications } from "@/components/sections/Certifications";
import { Work } from "@/components/sections/Work";
import { Contact } from "@/components/sections/Contact";
import { Footer } from "@/components/sections/Footer";
import { SoundGate } from "@/components/fx/SoundGate";

async function personJsonLd() {
  // the newest job still running (or, failing that, the newest job) describes the work title
  const jobs = (await getExperience()).sort((a, b) => Number(b.current) - Number(a.current) || b.start.localeCompare(a.start));
  const job = jobs[0];
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    name: profile.name,
    ...(job ? { jobTitle: job.role, worksFor: { "@type": "Organization", name: job.company } } : {}),
    alumniOf: { "@type": "CollegeOrUniversity", name: education.school },
    address: { "@type": "PostalAddress", addressLocality: "Pacitan", addressRegion: "East Java", addressCountry: "ID" },
    email: `mailto:${profile.email}`,
    sameAs: [profile.links.linkedin, profile.links.github, profile.links.instagram].filter(Boolean),
    knowsLanguage: ["id", "en", "ms"],
  };
}

export default async function Home() {
  // read from the folders (see lib/content.ts)
  const [projects, certifications, jsonLd] = await Promise.all([getProjects(), getCertificates(), personJsonLd()]);
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <SoundGate />
      <Nav />
      <main>
        <Hero />
        <About />
        <Experience />
        <Work projects={projects} />
        <Skills />
        <Certifications certifications={certifications} />
        <Contact />
      </main>
      <Footer />
    </>
  );
}
