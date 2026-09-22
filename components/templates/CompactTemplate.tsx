import type { ResumeData } from "@/lib/types";
import { cleanBullets, contactItems, formatDateRange, urlHref, urlLabel } from "@/lib/format";

function Heading({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="mb-1.5 border-b border-zinc-800 pb-0.5 text-[8pt] font-bold uppercase tracking-[0.15em] text-zinc-800 break-after-avoid">
      {children}
    </h2>
  );
}

export function CompactTemplate({ data }: { data: ResumeData }) {
  const contact = contactItems(data);

  return (
    <div className="font-sans text-[9pt] leading-[1.35] text-zinc-900">
      <header className="flex items-end justify-between gap-6 border-b-2 border-zinc-800 pb-2 break-after-avoid">
        <div>
          <h1 className="text-[17pt] font-bold leading-none tracking-tight">
            {data.fullName || "Your Name"}
          </h1>
          {data.jobTitle && <p className="mt-1 text-[10pt] text-zinc-600">{data.jobTitle}</p>}
        </div>
        {contact.length > 0 && (
          <ul className="shrink-0 text-right text-[8pt] leading-[1.4] text-zinc-600">
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
        )}
      </header>

      <div className="mt-3 grid grid-cols-[minmax(0,1fr)_52mm] gap-x-6">
        <main className="min-w-0 space-y-3.5">
          {data.summary && (
            <section>
              <Heading>Summary</Heading>
              <p>{data.summary}</p>
            </section>
          )}

          {data.experience.length > 0 && (
            <section>
              <Heading>Experience</Heading>
              <div className="space-y-2.5">
                {data.experience.map((entry) => {
                  const bullets = cleanBullets(entry.bullets);
                  return (
                    <article key={entry.id} className="break-inside-avoid">
                      <div className="flex items-baseline justify-between gap-3">
                        <h3 className="font-bold">
                          {entry.role || "Role"}
                          {entry.company && (
                            <span className="font-normal text-zinc-600"> &mdash; {entry.company}</span>
                          )}
                        </h3>
                        <span className="shrink-0 text-[8pt] text-zinc-500">{formatDateRange(entry)}</span>
                      </div>
                      {bullets.length > 0 && (
                        <ul className="mt-0.5 list-disc space-y-0.5 pl-3.5">
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
          )}

          {data.projects.length > 0 && (
            <section>
              <Heading>Projects</Heading>
              <div className="space-y-1.5">
                {data.projects.map((p) => (
                  <article key={p.id} className="break-inside-avoid">
                    <h3 className="font-bold">
                      {p.name || "Project"}
                      {p.link && (
                        <a href={urlHref(p.link)} className="ml-2 font-normal text-[8pt] text-zinc-500 hover:underline">
                          {urlLabel(p.link)}
                        </a>
                      )}
                    </h3>
                    {p.description && <p>{p.description}</p>}
                  </article>
                ))}
              </div>
            </section>
          )}
        </main>

        <aside className="min-w-0 space-y-3.5">
          {data.skills.length > 0 && (
            <section>
              <Heading>Skills</Heading>
              <ul className="flex flex-wrap gap-1 break-inside-avoid">
                {data.skills.map((s) => (
                  <li key={s} className="rounded-sm border border-zinc-300 px-1.5 py-px text-[8pt]">
                    {s}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {data.education.length > 0 && (
            <section>
              <Heading>Education</Heading>
              <div className="space-y-1.5">
                {data.education.map((e) => (
                  <div key={e.id} className="break-inside-avoid">
                    <p className="font-bold">{e.degree || "Degree"}</p>
                    {e.institution && <p className="text-zinc-600">{e.institution}</p>}
                    {e.year && <p className="text-[8pt] text-zinc-500">{e.year}</p>}
                  </div>
                ))}
              </div>
            </section>
          )}

          {data.languages.length > 0 && (
            <section>
              <Heading>Languages</Heading>
              <ul className="space-y-0.5 break-inside-avoid">
                {data.languages.map((l) => (
                  <li key={l}>{l}</li>
                ))}
              </ul>
            </section>
          )}
        </aside>
      </div>
    </div>
  );
}
