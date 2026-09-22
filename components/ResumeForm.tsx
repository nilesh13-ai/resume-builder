"use client";

import type { EducationEntry, ExperienceEntry, ResumeData } from "@/lib/types";
import { newId } from "@/lib/format";
import { MonthYearPicker, YearSelect } from "./MonthYearPicker";

const SUMMARY_GUIDE = 400;

const inputClass =
  "w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-base text-zinc-900 md:text-sm shadow-sm placeholder:text-zinc-400 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/30 disabled:bg-zinc-100 disabled:text-zinc-400";

function Field({
  label,
  hint,
  children,
  className,
}: {
  label: string;
  hint?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <label className={`block ${className ?? ""}`}>
      <span className="mb-1 block text-xs font-medium text-zinc-600">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-xs text-zinc-400">{hint}</span>}
    </label>
  );
}

function SectionCard({
  title,
  action,
  children,
}: {
  title: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-lg border border-zinc-200 bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-zinc-900">{title}</h2>
        {action}
      </div>
      {children}
    </section>
  );
}

function AddButton({ onClick, label }: { onClick: () => void; label: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-md border border-sky-200 bg-sky-50 px-3 py-1.5 text-xs font-medium text-sky-700 hover:bg-sky-100"
    >
      + {label}
    </button>
  );
}

function RemoveButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="-my-1 -mr-2 rounded px-2 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 hover:text-red-700"
    >
      Remove
    </button>
  );
}

export function ResumeForm({
  data,
  onChange,
}: {
  data: ResumeData;
  onChange: (data: ResumeData) => void;
}) {
  const set = <K extends keyof ResumeData>(key: K, value: ResumeData[K]) =>
    onChange({ ...data, [key]: value });

  const updateExperience = (id: string, patch: Partial<ExperienceEntry>) =>
    set(
      "experience",
      data.experience.map((e) => (e.id === id ? { ...e, ...patch } : e)),
    );
  const removeExperience = (id: string) =>
    set("experience", data.experience.filter((e) => e.id !== id));
  const addExperience = () =>
    set("experience", [
      ...data.experience,
      { id: newId(), company: "", role: "", startDate: "", endDate: "", current: false, bullets: [] },
    ]);

  const updateEducation = (id: string, patch: Partial<EducationEntry>) =>
    set(
      "education",
      data.education.map((e) => (e.id === id ? { ...e, ...patch } : e)),
    );
  const removeEducation = (id: string) =>
    set("education", data.education.filter((e) => e.id !== id));
  const addEducation = () =>
    set("education", [
      ...data.education,
      { id: newId(), institution: "", degree: "", year: "" },
    ]);

  return (
    <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
      <SectionCard title="Personal details">
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Full name">
            <input className={inputClass} value={data.fullName} onChange={(e) => set("fullName", e.target.value)} />
          </Field>
          <Field label="Job title">
            <input className={inputClass} value={data.jobTitle} onChange={(e) => set("jobTitle", e.target.value)} />
          </Field>
          <Field label="Email">
            <input className={inputClass} type="email" value={data.email} onChange={(e) => set("email", e.target.value)} />
          </Field>
          <Field label="Phone">
            <input className={inputClass} type="tel" value={data.phone} onChange={(e) => set("phone", e.target.value)} />
          </Field>
          <Field label="Location">
            <input className={inputClass} value={data.location} onChange={(e) => set("location", e.target.value)} />
          </Field>
          <Field label="LinkedIn URL">
            <input className={inputClass} type="url" value={data.linkedin} onChange={(e) => set("linkedin", e.target.value)} />
          </Field>
          <Field
            label="Professional summary"
            className="sm:col-span-2"
            hint={<SummaryCounter length={data.summary.length} />}
          >
            <textarea className={`${inputClass} min-h-24 resize-y`} rows={4} value={data.summary} onChange={(e) => set("summary", e.target.value)} />
          </Field>
        </div>
      </SectionCard>

      <SectionCard
        title="Work experience"
        action={<AddButton label="Add experience" onClick={addExperience} />}
      >
        <div className="space-y-4">
          {data.experience.length === 0 && (
            <p className="text-sm text-zinc-400">No entries yet.</p>
          )}
          {data.experience.map((entry, index) => (
            <div key={entry.id} className="rounded-md border border-zinc-200 bg-zinc-50 p-3">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-xs font-medium text-zinc-500">Entry {index + 1}</span>
                <RemoveButton onClick={() => removeExperience(entry.id)} />
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="Company">
                  <input className={inputClass} value={entry.company} onChange={(e) => updateExperience(entry.id, { company: e.target.value })} />
                </Field>
                <Field label="Role">
                  <input className={inputClass} value={entry.role} onChange={(e) => updateExperience(entry.id, { role: e.target.value })} />
                </Field>
                <Field label="Start date">
                  <MonthYearPicker value={entry.startDate} onChange={(startDate) => updateExperience(entry.id, { startDate })} />
                </Field>
                <div>
                  <Field label="End date">
                    <MonthYearPicker
                      value={entry.current ? "" : entry.endDate}
                      disabled={entry.current}
                      onChange={(endDate) => updateExperience(entry.id, { endDate })}
                    />
                  </Field>
                  <label className="mt-1 flex items-center gap-2 py-1.5 text-xs text-zinc-600">
                    <input
                      type="checkbox"
                      className="h-4 w-4 accent-sky-600"
                      checked={entry.current}
                      onChange={(e) => updateExperience(entry.id, { current: e.target.checked })}
                    />
                    I currently work here (Present)
                  </label>
                </div>
                <Field label="Bullet points" hint="One bullet point per line." className="sm:col-span-2">
                  <textarea
                    className={`${inputClass} min-h-24 resize-y`}
                    rows={4}
                    value={entry.bullets.join("\n")}
                    onChange={(e) => updateExperience(entry.id, { bullets: e.target.value.split("\n") })}
                  />
                </Field>
              </div>
            </div>
          ))}
        </div>
      </SectionCard>

      <SectionCard
        title="Education"
        action={<AddButton label="Add education" onClick={addEducation} />}
      >
        <div className="space-y-4">
          {data.education.length === 0 && (
            <p className="text-sm text-zinc-400">No entries yet.</p>
          )}
          {data.education.map((entry, index) => (
            <div key={entry.id} className="rounded-md border border-zinc-200 bg-zinc-50 p-3">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-xs font-medium text-zinc-500">Entry {index + 1}</span>
                <RemoveButton onClick={() => removeEducation(entry.id)} />
              </div>
              <div className="grid gap-3 sm:grid-cols-[1fr_1fr_6rem]">
                <Field label="Institution">
                  <input className={inputClass} value={entry.institution} onChange={(e) => updateEducation(entry.id, { institution: e.target.value })} />
                </Field>
                <Field label="Degree">
                  <input className={inputClass} value={entry.degree} onChange={(e) => updateEducation(entry.id, { degree: e.target.value })} />
                </Field>
                <Field label="Year">
                  <YearSelect value={entry.year} onChange={(year) => updateEducation(entry.id, { year })} />
                </Field>
              </div>
            </div>
          ))}
        </div>
      </SectionCard>

      <SectionCard title="Skills">
        <Field label="Skills" hint="Separate skills with commas.">
          <textarea className={`${inputClass} min-h-20 resize-y`} rows={3} value={data.skills} onChange={(e) => set("skills", e.target.value)} />
        </Field>
      </SectionCard>
    </form>
  );
}

function SummaryCounter({ length }: { length: number }) {
  const over = length > SUMMARY_GUIDE;
  return (
    <span className={`flex justify-between gap-2 ${over ? "text-amber-600" : "text-zinc-400"}`}>
      <span>{over ? "Recruiters skim: try to stay under the guide." : "Two to four sentences works best."}</span>
      <span className="tabular-nums" aria-live="polite">
        {length} / {SUMMARY_GUIDE}
      </span>
    </span>
  );
}
