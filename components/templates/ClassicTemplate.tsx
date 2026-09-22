import type { ResumeData } from "@/lib/types";
import { cleanBullets, contactItems, formatDateRange, urlHref, urlLabel } from "@/lib/format";
import { visibleSections, type SectionId } from "@/lib/sections";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-5">
      <h2 className="mb-2 border-b border-black pb-1 text-[11pt] font-bold uppercase tracking-[0.15em] break-after-avoid">
        {title}
      </h2>
      {children}
    </section>
  );
}

export function ClassicTemplate({ data }: { data: ResumeData }) {
  const contact = contactItems(data);

  const blocks: Record<SectionId, React.ReactNode> = {
    summary: (
      <Section title="Summary">
        <p className="text-justify">{data.summary}</p>
      </Section>
    ),
    experience: (
      <Section title="Experience">
        <div className="space-y-3.5">
          {data.experience.map((entry) => {
            const bullets = cleanBullets(entry.bullets);
            return (
              <article key={entry.id} className="break-inside-avoid">
                <div className="flex items-baseline justify-between gap-4">
                  <h3 className="font-bold">{entry.role || "Role"}</h3>
                  <span className="shrink-0 text-[9.5pt]">{formatDateRange(entry)}</span>
                </div>
                {entry.company && <p className="italic">{entry.company}</p>}
                {bullets.length > 0 && (
                  <ul className="mt-1 list-disc space-y-0.5 pl-5">
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
    ),
    projects: (
      <Section title="Projects">
        <div className="space-y-2">
          {data.projects.map((p) => (
            <article key={p.id} className="break-inside-avoid">
              <h3 className="font-bold">
                {p.name || "Project"}
                {p.link && (
                  <>
                    {" "}
                    <a href={urlHref(p.link)} className="font-normal text-[9.5pt] underline">
                      {urlLabel(p.link)}
                    </a>
                  </>
                )}
              </h3>
              {p.description && <p>{p.description}</p>}
            </article>
          ))}
        </div>
      </Section>
    ),
    education: (
      <Section title="Education">
        <div className="space-y-2">
          {data.education.map((entry) => (
            <div key={entry.id} className="flex items-baseline justify-between gap-4 break-inside-avoid">
              <div>
                <p className="font-bold">{entry.degree || "Degree"}</p>
                {entry.institution && <p className="italic">{entry.institution}</p>}
              </div>
              <span className="shrink-0 text-[9.5pt]">{entry.year}</span>
            </div>
          ))}
        </div>
      </Section>
    ),
    skills: (
      <Section title="Skills">
        <p className="break-inside-avoid">{data.skills.join("  •  ")}</p>
      </Section>
    ),
    languages: (
      <Section title="Languages">
        <p className="break-inside-avoid">{data.languages.join("  •  ")}</p>
      </Section>
    ),
  };

  return (
    <div className="font-serif text-[10.5pt] leading-[1.45] text-black">
      <header className="border-b-2 border-black pb-3 text-center break-after-avoid">
        <h1 className="text-[22pt] font-bold uppercase tracking-[0.08em]">{data.fullName || "Your Name"}</h1>
        {data.jobTitle && <p className="mt-0.5 text-[12pt] italic">{data.jobTitle}</p>}
        {contact.length > 0 && (
          <p className="mt-1.5 text-[9.5pt]">
            {contact.map((item, i) => (
              <span key={i}>
                {i > 0 && <span className="mx-1.5">|</span>}
                {item.href ? (
                  <a href={item.href} className="underline">
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
      {visibleSections(data).map((id) => (
        <div key={id}>{blocks[id]}</div>
      ))}
    </div>
  );
}
