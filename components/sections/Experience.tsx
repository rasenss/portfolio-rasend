import { getExperience } from "@/lib/content";
import type { Experience as Role } from "@/lib/content-types";
import { SectionHeading } from "@/components/ui/Pill";
import { NewCount, NewTag } from "@/components/ui/NewTag";

const newestFirst = (a: Role, b: Role) => b.start.localeCompare(a.start) || a.company.localeCompare(b.company);

/* Jobs come from content/experience (one file each). A job still running sits at the top
   under "Now", whatever year it started; the rest are grouped by the year they started. */
function groupJobs(experience: Role[]) {
  const current = experience.filter((e) => e.current).sort(newestFirst);
  const past = experience.filter((e) => !e.current).sort(newestFirst);
  const years = Array.from(new Set(past.map((e) => e.start.slice(0, 4))));
  const groups = [
  ...(current.length
    ? [{ key: "now", label: "NOW", note: `${current.length} ${current.length === 1 ? "role" : "roles"} I'm working on`, items: current }]
    : []),
  ...years.map((year) => {
    const items = past.filter((e) => e.start.startsWith(year));
    return { key: year, label: year, note: `${items.length} ${items.length === 1 ? "role" : "roles"} started this year`, items };
  }),
  ];
  return { current, groups };
}

/**
 * Work history on a "year spine". Each year is set huge in outline and fills
 * with amber as its group scrolls in. On large screens the year stays pinned
 * beside its roles (plain CSS sticky). Company names rise out of a mask as
 * they appear. Everything here is CSS: no scripts, nothing to get stuck.
 */
export async function Experience() {
  const jobs = await getExperience();
  const { current, groups } = groupJobs(jobs);
  const ids = jobs.map((j) => j.id);
  return (
    <section id="experience" className="relative px-5 py-24 md:px-10 md:py-36">
      <div className="scene mx-auto max-w-6xl">
        <SectionHeading title="Where I've worked">
          {current.length ? "What I'm working on now comes first, then everything else from newest to oldest." : "Newest first."}
          <NewCount scope="experience" all={ids} />
        </SectionHeading>

        <div className="mt-16 space-y-24 lg:mt-20 lg:space-y-36">
          {groups.map((g) => (
            <div key={g.key} className="xp-year grid gap-8 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-14">
              {/* the year: outline underneath, amber fill rising over it */}
              <div className="lg:sticky lg:top-28 lg:self-start">
                <h3 className="sr-only">{g.key === "now" ? "Current roles" : g.label}</h3>
                <div aria-hidden className="year-zoom relative w-max font-condensed text-[clamp(6rem,20vw,12rem)] font-black leading-[0.8]">
                  <span className="text-outline-amber block">{g.label}</span>
                  <span className="year-fill absolute inset-0 text-role">{g.label}</span>
                </div>
                <p className="mt-5 text-[15px] font-medium text-fg-soft">{g.note}</p>
              </div>

              {/* the roles */}
              <div className="space-y-16 lg:space-y-20 lg:pt-4">
                {g.items.map((item) => (
                  <article key={item.id} className="zoom-in">
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-[15px]">
                      <span className="font-bold text-role">{item.period}</span>
                      <span className="text-fg-soft">{item.type}</span>
                      <NewTag scope="experience" id={item.id} all={ids} />
                    </div>
                    <h4 className="mask-in mt-3 font-condensed text-[clamp(2.7rem,6.5vw,5.4rem)] font-black uppercase leading-[0.86]">
                      {item.company}
                    </h4>
                    <p className="mt-4 text-xl font-semibold">
                      {item.role}
                      {item.project && <span className="font-normal text-fg-soft">, {item.project}</span>}
                    </p>
                    <ul className="mt-6 max-w-[40rem] space-y-3 text-[16px] leading-relaxed text-fg/90">
                      {item.points.map((p) => (
                        <li key={p} className="flex gap-3">
                          <span aria-hidden className="mt-[0.62em] h-[3px] w-4 shrink-0 rounded-full bg-role" />
                          {p}
                        </li>
                      ))}
                    </ul>
                  </article>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
