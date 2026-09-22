"use client";

import type { EducationEntry, ExperienceEntry, ProjectEntry, ResumeData } from "@/lib/types";
import { moveItem, newId } from "@/lib/format";
import { MonthYearPicker, YearSelect } from "./MonthYearPicker";
import { TagInput } from "./TagInput";

const SUMMARY_GUIDE = 400;

const inputClass =
  "w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-base text-zinc-900 shadow-sm placeholder:text-zinc-400 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/30 disabled:bg-zinc-100 disabled:text-zinc-400 md:text-sm";

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

/**
 * Like Field, but the label points at `id` instead of wrapping the control.
 * Needed for controls that contain buttons (a wrapping <label> would activate
 * the first button when the label text is clicked).
 */
function FieldGroup({
  label,
  id,
  hint,
  children,
}: {
  label: string;
  id: string;
  hint?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label htmlFor={id} className="mb-1 block text-xs font-medium text-zinc-600">
        {label}
      </label>
      {children}
      {hint && <span className="mt-1 block text-xs text-zinc-400">{hint}</span>}
    </div>
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

/** Entry chrome: index label, move up/down, remove. */
function EntryHeader({
  index,
  count,
  onMove,
  onRemove,
}: {
  index: number;
  count: number;
  onMove: (to: number) => void;
  onRemove: () => void;
}) {
  const iconButton =
    "grid h-7 w-7 place-items-center rounded text-zinc-500 hover:bg-zinc-200 hover:text-zinc-800 disabled:opacity-30 disabled:hover:bg-transparent";
  return (
    <div className="mb-2 flex items-center justify-between">
      <span className="text-xs font-medium text-zinc-500">Entry {index + 1}</span>
      <div className="flex items-center gap-0.5">
        <button type="button" aria-label="Move up" className={iconButton} disabled={index === 0} onClick={() => onMove(index - 1)}>
          &uarr;
        </button>
        <button type="button" aria-label="Move down" className={iconButton} disabled={index === count - 1} onClick={() => onMove(index + 1)}>
          &darr;
        </button>
        <button
          type="button"
          onClick={onRemove}
          className="ml-1 rounded px-2 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 hover:text-red-700"
        >
          Remove
        </button>
      </div>
    </div>
  );
}

function Empty({ text }: { text: string }) {
  return <p className="rounded-md border border-dashed border-zinc-300 px-3 py-4 text-center text-sm text-zinc-400">{text}</p>;
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

  // Generic list helpers keyed by field.
  const listOps = <K extends "experience" | "education" | "projects">(key: K) => {
    type Item = ResumeData[K][number];
    return {
      update: (id: string, patch: Partial<Item>) =>
        set(key, data[key].map((e) => (e.id === id ? { ...e, ...patch } : e)) as ResumeData[K]),
      remove: (id: string) => set(key, data[key].filter((e) => e.id !== id) as ResumeData[K]),
      move: (from: number, to: number) => set(key, moveItem(data[key] as Item[], from, to) as ResumeData[K]),
      add: (item: Item) => set(key, [...data[key], item] as ResumeData[K]),
    };
  };
  const exp = listOps("experience");
  const edu = listOps("education");
  const proj = listOps("projects");

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
          <Field label="Website" className="sm:col-span-2">
            <input className={inputClass} type="url" placeholder="https://" value={data.website} onChange={(e) => set("website", e.target.value)} />
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
        action={
          <AddButton
            label="Add experience"
            onClick={() => exp.add({ id: newId(), company: "", role: "", startDate: "", endDate: "", current: false, bullets: [] })}
          />
        }
      >
        <div className="space-y-4">
          {data.experience.length === 0 && <Empty text="No experience yet. Add your most recent role first." />}
          {data.experience.map((entry: ExperienceEntry, index) => (
            <div key={entry.id} className="rounded-md border border-zinc-200 bg-zinc-50 p-3">
              <EntryHeader index={index} count={data.experience.length} onMove={(to) => exp.move(index, to)} onRemove={() => exp.remove(entry.id)} />
              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="Company">
                  <input className={inputClass} value={entry.company} onChange={(e) => exp.update(entry.id, { company: e.target.value })} />
                </Field>
                <Field label="Role">
                  <input className={inputClass} value={entry.role} onChange={(e) => exp.update(entry.id, { role: e.target.value })} />
                </Field>
                <Field label="Start date">
                  <MonthYearPicker label="Start date" value={entry.startDate} onChange={(startDate) => exp.update(entry.id, { startDate })} />
                </Field>
                <div>
                  <Field label="End date">
                    <MonthYearPicker
                      label="End date"
                      value={entry.current ? "" : entry.endDate}
                      disabled={entry.current}
                      onChange={(endDate) => exp.update(entry.id, { endDate })}
                    />
                  </Field>
                  <label className="mt-1 flex items-center gap-2 py-1.5 text-xs text-zinc-600">
                    <input
                      type="checkbox"
                      className="h-4 w-4 accent-sky-600"
                      checked={entry.current}
                      onChange={(e) => exp.update(entry.id, { current: e.target.checked })}
                    />
                    I currently work here (Present)
                  </label>
                </div>
                <Field label="Bullet points" hint="One bullet point per line." className="sm:col-span-2">
                  <textarea
                    className={`${inputClass} min-h-24 resize-y`}
                    rows={4}
                    value={entry.bullets.join("\n")}
                    onChange={(e) => exp.update(entry.id, { bullets: e.target.value.split("\n") })}
                  />
                </Field>
              </div>
            </div>
          ))}
        </div>
      </SectionCard>

      <SectionCard
        title="Education"
        action={<AddButton label="Add education" onClick={() => edu.add({ id: newId(), institution: "", degree: "", year: "" })} />}
      >
        <div className="space-y-4">
          {data.education.length === 0 && <Empty text="No education added." />}
          {data.education.map((entry: EducationEntry, index) => (
            <div key={entry.id} className="rounded-md border border-zinc-200 bg-zinc-50 p-3">
              <EntryHeader index={index} count={data.education.length} onMove={(to) => edu.move(index, to)} onRemove={() => edu.remove(entry.id)} />
              <div className="grid gap-3 sm:grid-cols-[1fr_1fr_7rem]">
                <Field label="Institution">
                  <input className={inputClass} value={entry.institution} onChange={(e) => edu.update(entry.id, { institution: e.target.value })} />
                </Field>
                <Field label="Degree">
                  <input className={inputClass} value={entry.degree} onChange={(e) => edu.update(entry.id, { degree: e.target.value })} />
                </Field>
                <Field label="Year">
                  <YearSelect value={entry.year} onChange={(year) => edu.update(entry.id, { year })} />
                </Field>
              </div>
            </div>
          ))}
        </div>
      </SectionCard>

      <SectionCard
        title="Projects"
        action={<AddButton label="Add project" onClick={() => proj.add({ id: newId(), name: "", description: "", link: "" })} />}
      >
        <div className="space-y-4">
          {data.projects.length === 0 && <Empty text="No projects added. Side projects and open source count." />}
          {data.projects.map((entry: ProjectEntry, index) => (
            <div key={entry.id} className="rounded-md border border-zinc-200 bg-zinc-50 p-3">
              <EntryHeader index={index} count={data.projects.length} onMove={(to) => proj.move(index, to)} onRemove={() => proj.remove(entry.id)} />
              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="Name">
                  <input className={inputClass} value={entry.name} onChange={(e) => proj.update(entry.id, { name: e.target.value })} />
                </Field>
                <Field label="Link">
                  <input className={inputClass} type="url" placeholder="https://" value={entry.link} onChange={(e) => proj.update(entry.id, { link: e.target.value })} />
                </Field>
                <Field label="Description" className="sm:col-span-2">
                  <textarea className={`${inputClass} min-h-16 resize-y`} rows={2} value={entry.description} onChange={(e) => proj.update(entry.id, { description: e.target.value })} />
                </Field>
              </div>
            </div>
          ))}
        </div>
      </SectionCard>

      <SectionCard title="Skills">
        <FieldGroup label="Skills" id="skills" hint="Press Enter or type a comma to add a skill.">
          <TagInput id="skills" value={data.skills} onChange={(skills) => set("skills", skills)} placeholder="e.g. TypeScript" />
        </FieldGroup>
      </SectionCard>

      <SectionCard title="Languages">
        <FieldGroup label="Languages" id="languages" hint="Include the level, e.g. “Spanish (Conversational)”.">
          <TagInput id="languages" value={data.languages} onChange={(languages) => set("languages", languages)} placeholder="e.g. English (Native)" />
        </FieldGroup>
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
