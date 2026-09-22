"use client";

import type { TemplateId } from "@/lib/types";
import { TEMPLATES } from "./templates";

/** Segmented control on wide screens, a native select on narrow ones. */
export function TemplateSwitcher({
  value,
  onChange,
}: {
  value: TemplateId;
  onChange: (value: TemplateId) => void;
}) {
  return (
    <>
      <div
        role="radiogroup"
        aria-label="Template"
        className="hidden rounded-md border border-zinc-300 bg-zinc-100 p-0.5 lg:inline-flex"
      >
        {TEMPLATES.map((t) => {
          const active = t.id === value;
          return (
            <button
              key={t.id}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => onChange(t.id)}
              className={`rounded px-3 py-1.5 text-sm font-medium transition-colors ${
                active ? "bg-white text-zinc-900 shadow-sm" : "text-zinc-600 hover:text-zinc-900"
              }`}
            >
              {t.name}
            </button>
          );
        })}
      </div>
      <label className="relative block lg:hidden">
        <span className="sr-only">Template</span>
        <select
          value={value}
          onChange={(e) => onChange(e.target.value as TemplateId)}
          className="appearance-none rounded-md border border-zinc-300 bg-white py-2 pl-3 pr-8 text-sm font-medium text-zinc-900 shadow-sm"
        >
          {TEMPLATES.map((t) => (
            <option key={t.id} value={t.id}>
              {t.name}
            </option>
          ))}
        </select>
        <svg viewBox="0 0 16 16" className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
          <path d="M4 6l4 4 4-4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </label>
    </>
  );
}
