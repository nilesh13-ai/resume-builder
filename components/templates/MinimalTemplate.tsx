import type { ResumeData } from "@/lib/types";
import { cleanBullets, contactItems, formatDateRange, urlHref, urlLabel } from "@/lib/format";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-4 border-t border-zinc-200 pt-3">
      <h2 className="mb-2.5 text-[8.5pt] font-medium uppercase tracking-[0.25em] text-zinc-400 break-after-avoid">
        {title}
      </h2>
      {children}
    </section>
  );
}

/** Two-column row: muted meta on the left, content on the right. */
function Row({ meta, children }: { meta: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[32mm_minmax(0,1fr)] gap-x-4 break-inside-avoid">
      <span className="pt-px text-[9pt] text-zinc-400">{meta}</span>
      <div className="min-w-0">{children}</div>
    </div>
  );
}

export function MinimalTemplate({ data }: { data: ResumeData }) {
  const contact = contactItems(data);

  return (
    <div className="font-sans text-[9.5pt] leading-[1.5] text-zinc-800">
      <header className="break-after-avoid">
        <h1 className="text-[21pt] font-light leading-tight tracking-tight text-zinc-900">
          {data.fullName || "Your Name"}
        </h1>
        {data.jobTitle && <p className="mt-1 text-[11pt] text-zinc-500">{data.jobTitle}</p>}
        {contact.length > 0 && (
          <p className="mt-2.5 text-[9pt] text-zinc-500">
            {contact.map((item, i) => (
              <span key={i}>
                {i > 0 && <span className="mx-2 text-zinc-300">&middot;</span>}
                {item.href ? (
                  <a href={item.href} className="text-zinc-700">
                    {item.label}
                  </a>
                ) : (
                  item.label
                )}
              </span>
            ))}
          </p>
        )}
      </header>

      {data.summary && (
        <Section title="Summary">
          <p className="max-w-[150mm] text-zinc-700">{data.summary}</p>
        </Section>
      )}

      {data.experience.length > 0 && (
        <Section title="Experience">
          <div className="space-y-3.5">
            {data.experience.map((entry) => {
              const bullets = cleanBullets(entry.bullets);
              return (
                <Row key={entry.id} meta={formatDateRange(entry)}>
                  <h3 className="font-semibold text-zinc-900">{entry.role || "Role"}</h3>
                  {entry.company && <p className="text-zinc-500">{entry.company}</p>}
                  {bullets.length > 0 && (
                    <ul className="mt-1.5 space-y-0.5 text-zinc-700">
                      {bullets.map((b, i) => (
                        <li key={i} className="flex gap-2">
                          <span className="select-none text-zinc-300" aria-hidden>
                            &ndash;
                          </span>
                          <span>{b}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </Row>
              );
            })}
          </div>
        </Section>
      )}

      {data.projects.length > 0 && (
        <Section title="Projects">
          <div className="space-y-3">
            {data.projects.map((p) => (
              <Row
                key={p.id}
                meta={
                  p.link ? (
                    <a href={urlHref(p.link)} className="break-all text-zinc-500">
                      {urlLabel(p.link)}
                    </a>
                  ) : (
                    ""
                  )
                }
              >
                <p className="font-semibold text-zinc-900">{p.name || "Project"}</p>
                {p.description && <p className="text-zinc-700">{p.description}</p>}
              </Row>
            ))}
          </div>
        </Section>
      )}

      {data.education.length > 0 && (
        <Section title="Education">
          <div className="space-y-3">
            {data.education.map((entry) => (
              <Row key={entry.id} meta={entry.year}>
                <p className="font-semibold text-zinc-900">{entry.degree || "Degree"}</p>
                {entry.institution && <p className="text-zinc-500">{entry.institution}</p>}
              </Row>
            ))}
          </div>
        </Section>
      )}

      {data.skills.length > 0 && (
        <Section title="Skills">
          <p className="max-w-[150mm] text-zinc-700 break-inside-avoid">{data.skills.join(", ")}</p>
        </Section>
      )}

      {data.languages.length > 0 && (
        <Section title="Languages">
          <p className="max-w-[150mm] text-zinc-700 break-inside-avoid">{data.languages.join(", ")}</p>
        </Section>
      )}
    </div>
  );
}
