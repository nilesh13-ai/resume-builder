import type { ResumeData } from "@/lib/types";
import { cleanBullets, contactItems, formatDateRange, urlHref, urlLabel } from "@/lib/format";
import { visibleSections, type SectionId } from "@/lib/sections";

/** Sections that live in the sidebar; everything else goes in the main column. */
const SIDEBAR: ReadonlySet<SectionId> = new Set<SectionId>(["skills", "languages", "education"]);

function SidebarHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="mb-2 text-[9pt] font-semibold uppercase tracking-[0.2em] text-sky-200 break-after-avoid">{children}</h2>
  );
}

function MainHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="mb-2.5 flex items-center gap-3 text-[10pt] font-bold uppercase tracking-[0.18em] text-sky-900 break-after-avoid">
      {children}
      <span className="h-px flex-1 bg-sky-900/30" aria-hidden />
    </h2>
  );
}

export function ModernTemplate({ data }: { data: ResumeData }) {
  const contact = contactItems(data);
  const order = visibleSections(data);

  const sidebarBlocks: Partial<Record<SectionId, React.ReactNode>> = {
    skills: (
      <section className="mt-6">
        <SidebarHeading>Skills</SidebarHeading>
        <ul className="flex flex-wrap gap-1.5">
          {data.skills.map((s) => (
            <li key={s} className="rounded-sm bg-white/15 px-2 py-0.5 text-[9pt] leading-tight">
              {s}
            </li>
          ))}
        </ul>
      </section>
    ),
    languages: (
      <section className="mt-6">
        <SidebarHeading>Languages</SidebarHeading>
        <ul className="space-y-1 text-[9.5pt]">
          {data.languages.map((l) => (
            <li key={l}>{l}</li>
          ))}
        </ul>
      </section>
    ),
    education: (
      <section className="mt-6">
        <SidebarHeading>Education</SidebarHeading>
        <ul className="space-y-2.5 text-[9.5pt]">
          {data.education.map((e) => (
            <li key={e.id} className="break-inside-avoid">
              <p className="font-semibold">{e.degree || "Degree"}</p>
              {e.institution && <p className="text-sky-100">{e.institution}</p>}
              {e.year && <p className="text-sky-200">{e.year}</p>}
            </li>
          ))}
        </ul>
      </section>
    ),
  };

  const mainBlocks: Partial<Record<SectionId, React.ReactNode>> = {
    summary: (
      <section className="mt-5">
        <MainHeading>Profile</MainHeading>
        <p>{data.summary}</p>
      </section>
    ),
    experience: (
      <section className="mt-5">
        <MainHeading>Experience</MainHeading>
        <div className="space-y-4">
          {data.experience.map((entry) => {
            const bullets = cleanBullets(entry.bullets);
            return (
              <article key={entry.id} className="break-inside-avoid">
                <div className="flex items-baseline justify-between gap-4">
                  <h3 className="font-semibold text-zinc-900">{entry.role || "Role"}</h3>
                  <span className="shrink-0 text-[9pt] text-zinc-500">{formatDateRange(entry)}</span>
                </div>
                {entry.company && <p className="text-[9.5pt] font-medium text-sky-800">{entry.company}</p>}
                {bullets.length > 0 && (
                  <ul className="mt-1.5 list-disc space-y-1 pl-4 marker:text-sky-700">
                    {bullets.map((b, i) => (
                      <li key={i}>{b}</li>
                    ))}
                  </ul>
                )}
              </article>
            );
          })}
        </div>
      </section>
    ),
    projects: (
      <section className="mt-5">
        <MainHeading>Projects</MainHeading>
        <div className="space-y-3">
          {data.projects.map((p) => (
            <article key={p.id} className="break-inside-avoid">
              <div className="flex items-baseline justify-between gap-4">
                <h3 className="font-semibold text-zinc-900">{p.name || "Project"}</h3>
                {p.link && (
                  <a href={urlHref(p.link)} className="shrink-0 text-[9pt] text-sky-700 hover:underline">
                    {urlLabel(p.link)}
                  </a>
                )}
              </div>
              {p.description && <p className="mt-0.5">{p.description}</p>}
            </article>
          ))}
        </div>
      </section>
    ),
  };

  return (
    <div className="grid grid-cols-[58mm_minmax(0,1fr)] gap-6 font-sans text-[10pt] leading-[1.45] text-zinc-800">
      <aside className="rounded-md bg-sky-900 px-5 py-6 text-white">
        {contact.length > 0 && (
          <section>
            <SidebarHeading>Contact</SidebarHeading>
            <ul className="space-y-1.5 text-[9.5pt] break-words">
              {contact.map((c, i) => (
                <li key={i}>
                  {c.href ? (
                    <a href={c.href} className="hover:underline">
                      {c.label}
                    </a>
                  ) : (
                    c.label
                  )}
                </li>
              ))}
            </ul>
          </section>
        )}
        {order.filter((id) => SIDEBAR.has(id)).map((id) => (
          <div key={id}>{sidebarBlocks[id]}</div>
        ))}
      </aside>

      <main className="min-w-0 pt-1">
        <header className="break-after-avoid">
          <h1 className="text-[24pt] font-bold leading-tight tracking-tight text-sky-900">{data.fullName || "Your Name"}</h1>
          {data.jobTitle && <p className="mt-1 text-[12pt] font-medium text-zinc-600">{data.jobTitle}</p>}
        </header>
        {order.filter((id) => !SIDEBAR.has(id)).map((id) => (
          <div key={id}>{mainBlocks[id]}</div>
        ))}
      </main>
    </div>
  );
}
