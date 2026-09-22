"use client";

import { useState } from "react";

/** Comma/Enter-separated tag editor. Backspace on an empty input removes the last tag. */
export function TagInput({
  value,
  onChange,
  placeholder,
  id,
}: {
  value: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
  id?: string;
}) {
  const [draft, setDraft] = useState("");

  const commit = (text: string) => {
    const tags = text
      .split(",")
      .map((t) => t.trim())
      .filter((t) => t && !value.includes(t));
    if (tags.length) onChange([...value, ...tags]);
    setDraft("");
  };

  return (
    <div className="flex min-h-11 w-full flex-wrap items-center gap-1.5 rounded-md border border-zinc-300 bg-white px-2 py-1.5 shadow-sm focus-within:border-sky-500 focus-within:ring-2 focus-within:ring-sky-500/30">
      {value.map((tag) => (
        <span
          key={tag}
          className="flex items-center gap-1 rounded bg-zinc-100 py-0.5 pl-2 pr-1 text-sm text-zinc-800"
        >
          {tag}
          <button
            type="button"
            aria-label={`Remove ${tag}`}
            onClick={() => onChange(value.filter((t) => t !== tag))}
            className="rounded px-1 text-zinc-400 hover:bg-zinc-200 hover:text-zinc-700"
          >
            &times;
          </button>
        </span>
      ))}
      <input
        id={id}
        className="min-w-24 flex-1 bg-transparent px-1 py-0.5 text-base text-zinc-900 outline-none placeholder:text-zinc-400 md:text-sm"
        value={draft}
        placeholder={value.length ? "" : placeholder}
        onChange={(e) => {
          if (e.target.value.includes(",")) commit(e.target.value);
          else setDraft(e.target.value);
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            commit(draft);
          } else if (e.key === "Backspace" && draft === "" && value.length) {
            onChange(value.slice(0, -1));
          }
        }}
        onBlur={() => draft.trim() && commit(draft)}
      />
    </div>
  );
}
