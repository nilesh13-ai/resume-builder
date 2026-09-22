"use client";

import type { TemplateId } from "@/lib/types";

const OPTIONS: { id: TemplateId; label: string }[] = [
  { id: "classic", label: "Classic" },
  { id: "modern", label: "Modern" },
  { id: "minimal", label: "Minimal" },
];

export function TemplateToggle({
  value,
  onChange,
}: {
  value: TemplateId;
  onChange: (value: TemplateId) => void;
}) {
  return (
    <div
      role="radiogroup"
      aria-label="Template"
      className="inline-flex rounded-md border border-zinc-300 bg-zinc-100 p-0.5"
    >
      {OPTIONS.map((option) => {
        const active = option.id === value;
        return (
          <button
            key={option.id}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(option.id)}
            className={`rounded px-3 py-1.5 text-sm font-medium transition-colors ${
              active
                ? "bg-white text-zinc-900 shadow-sm"
                : "text-zinc-600 hover:text-zinc-900"
            }`}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
