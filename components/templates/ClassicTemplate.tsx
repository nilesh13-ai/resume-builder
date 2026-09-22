import type { ResumeData } from "@/lib/types";
import {
  cleanBullets,
  formatDateRange,
  linkedinHref,
  linkedinLabel,
  splitSkills,
} from "@/lib/format";

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
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
  const contact = [
    data.email,
    data.phone,
    data.location,
    data.linkedin ? linkedinLabel(data.linkedin) : "",
  ].filter(Boolean);
  const skills = splitSkills(data.skills);

  return (
    <div className="font-serif text-[10.5pt] leading-[1.45] text-black">
      <header className="border-b-2 border-black pb-3 text-center break-after-avoid">
        <h1 className="text-[22pt] font-bold uppercase tracking-[0.08em]">
          {data.fullName || "Your Name"}
        </h1>
        {data.jobTitle && (
          <p className="mt-0.5 text-[12pt] italic">{data.jobTitle}</p>
        )}
        {contact.length > 0 && (
          <p className="mt-1.5 text-[9.5pt]">
            {contact.map((item, i) => (
              <span key={i}>
                {i > 0 && <span className="mx-1.5">|</span>}
                {item === linkedinLabel(data.linkedin) && data.linkedin ? (
                  <a href={linkedinHref(data.linkedin)} className="underline">
                    {item}
                  </a>
                ) : (
                  item
                )}
              </span>
            ))}
          </p>
        )}
      </header>

      {data.summary && (
        <Section title="Summary">
          <p className="text-justify">{data.summary}</p>
        </Section>
      )}

      {data.experience.length > 0 && (
        <Section title="Experience">
          <div className="space-y-3.5">
            {data.experience.map((entry) => {
              const bullets = cleanBullets(entry.bullets);
              return (
                <article key={entry.id} className="break-inside-avoid">
                  <div className="flex items-baseline justify-between gap-4">
                    <h3 className="font-bold">{entry.role || "Role"}</h3>
                    <span className="shrink-0 text-[9.5pt]">
                      {formatDateRange(entry)}
                    </span>
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
      )}

      {data.education.length > 0 && (
        <Section title="Education">
          <div className="space-y-2">
            {data.education.map((entry) => (
              <div
                key={entry.id}
                className="flex items-baseline justify-between gap-4 break-inside-avoid"
              >
                <div>
                  <p className="font-bold">{entry.degree || "Degree"}</p>
                  {entry.institution && <p className="italic">{entry.institution}</p>}
                </div>
                <span className="shrink-0 text-[9.5pt]">{entry.year}</span>
              </div>
            ))}
          </div>
        </Section>
      )}

      {skills.length > 0 && (
        <Section title="Skills">
          <p className="break-inside-avoid">{skills.join("  •  ")}</p>
        </Section>
      )}
    </div>
  );
}
