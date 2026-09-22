import type { ResumeData } from "@/lib/types";
import { cleanBullets, contactItems, formatDateRange, urlHref, urlLabel } from "@/lib/format";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-6">
      <h2 className="mb-3 text-[11pt] font-extrabold uppercase tracking-[0.12em] text-rose-700 break-after-avoid">
        {title}
        <span className="mt-1 block h-1 w-10 bg-rose-700" aria-hidden />
      </h2>
      {children}
    </section>
  );
}

export function BoldTemplate({ data }: { data: ResumeData }) {
  const contact = contactItems(data);

  return (
    <div className="font-sans text-[10pt] leading-[1.45] text-zinc-800">
      <header className="rounded-lg bg-zinc-900 px-8 py-7 text-white break-after-avoid">
        <h1 className="text-[30pt] font-black uppercase leading-none tracking-tight">
          {data.fullName || "Your Name"}
        </h1>
        {data.jobTitle && (
          <p className="mt-2 text-[13pt] font-semibold text-rose-400">{data.jobTitle}</p>
        )}
        {contact.length > 0 && (
          <ul className="mt-4 flex flex-wrap gap-x-5 gap-y-1 text-[9pt] text-zinc-300">
            {contact.map((c, i) => (
              <li key={i}>
                {c.href ? (
                  <a href={c.href} className="hover:text-white">
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

      {data.summary && (
        <Section title="About">
          <p className="text-[10.5pt] leading-[1.5]">{data.summary}</p>
        </Section>
      )}

      {data.experience.length > 0 && (
        <Section title="Experience">
          <div className="space-y-4">
            {data.experience.map((entry) => {
              const bullets = cleanBullets(entry.bullets);
              return (
                <article key={entry.id} className="break-inside-avoid">
                  <h3 className="text-[12pt] font-bold text-zinc-900">{entry.role || "Role"}</h3>
                  <p className="text-[9.5pt] font-semibold uppercase tracking-wide text-zinc-500">
                    {[entry.company, formatDateRange(entry)].filter(Boolean).join("  ·  ")}
                  </p>
                  {bullets.length > 0 && (
                    <ul className="mt-1.5 list-disc space-y-1 pl-4 marker:text-rose-700">
                      {bullets.map((b, i) => (
                        <li key={i}>{b}</li>
                      ))}
                    </ul>
                  )}
                </article>
              );
            })}
          </div>
        </Section>
      )}

      {data.projects.length > 0 && (
        <Section title="Projects">
          <div className="grid grid-cols-2 gap-x-6 gap-y-3">
            {data.projects.map((p) => (
              <article key={p.id} className="break-inside-avoid">
                <h3 className="font-bold text-zinc-900">{p.name || "Project"}</h3>
                {p.description && <p className="mt-0.5 text-[9.5pt]">{p.description}</p>}
                {p.link && (
                  <a href={urlHref(p.link)} className="text-[9pt] font-semibold text-rose-700">
                    {urlLabel(p.link)}
                  </a>
                )}
              </article>
            ))}
          </div>
        </Section>
      )}

      <div className="grid grid-cols-2 gap-x-8 break-inside-avoid">
        {data.education.length > 0 && (
          <Section title="Education">
            <div className="space-y-2.5">
              {data.education.map((e) => (
                <div key={e.id} className="break-inside-avoid">
                  <p className="font-bold text-zinc-900">{e.degree || "Degree"}</p>
                  <p className="text-[9.5pt] text-zinc-600">
                    {[e.institution, e.year].filter(Boolean).join(", ")}
                  </p>
                </div>
              ))}
            </div>
          </Section>
        )}
        <div>
          {data.skills.length > 0 && (
            <Section title="Skills">
              <ul className="flex flex-wrap gap-1.5 break-inside-avoid">
                {data.skills.map((s) => (
                  <li
                    key={s}
                    className="rounded-full border-2 border-zinc-900 px-2.5 py-0.5 text-[9pt] font-semibold text-zinc-900"
                  >
                    {s}
                  </li>
                ))}
              </ul>
            </Section>
          )}
          {data.languages.length > 0 && (
            <Section title="Languages">
              <p className="break-inside-avoid font-medium">{data.languages.join("  ·  ")}</p>
            </Section>
          )}
        </div>
      </div>
    </div>
  );
}
