"use client";

import { useRef, useState } from "react";
import { moveItem } from "@/lib/format";
import { SECTION_LABELS, type SectionConfig } from "@/lib/sections";

/**
 * Drag-and-drop (plus keyboard up/down) ordering and visibility toggles for
 * resume sections. Uses native HTML drag events, so no extra dependency.
 */
export function SectionOrderEditor({
  sections,
  onChange,
}: {
  sections: SectionConfig[];
  onChange: (sections: SectionConfig[]) => void;
}) {
  // The dragged index lives in a ref so drop handlers see it immediately,
  // independent of React's state flushing; state only drives the styling.
  const dragIndexRef = useRef<number | null>(null);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [overIndex, setOverIndex] = useState<number | null>(null);
  const startDrag = (index: number | null) => {
    dragIndexRef.current = index;
    setDragIndex(index);
  };

  const move = (from: number, to: number) => onChange(moveItem(sections, from, to));
  const toggle = (index: number) =>
    onChange(sections.map((s, i) => (i === index ? { ...s, visible: !s.visible } : s)));

  const iconButton =
    "grid h-7 w-7 place-items-center rounded text-zinc-500 hover:bg-zinc-200 hover:text-zinc-800 disabled:opacity-30 disabled:hover:bg-transparent";

  return (
    <ol className="space-y-1" aria-label="Section order">
      {sections.map((section, index) => {
        const label = SECTION_LABELS[section.id];
        const isOver = overIndex === index && dragIndex !== null && dragIndex !== index;
        return (
          <li
            key={section.id}
            draggable
            onDragStart={(e) => {
              startDrag(index);
              e.dataTransfer.effectAllowed = "move";
              e.dataTransfer.setData("text/plain", section.id);
            }}
            onDragOver={(e) => {
              e.preventDefault();
              e.dataTransfer.dropEffect = "move";
              if (overIndex !== index) setOverIndex(index);
            }}
            onDragLeave={() => setOverIndex((o) => (o === index ? null : o))}
            onDrop={(e) => {
              e.preventDefault();
              const from = dragIndexRef.current;
              if (from !== null && from !== index) move(from, index);
              startDrag(null);
              setOverIndex(null);
            }}
            onDragEnd={() => {
              startDrag(null);
              setOverIndex(null);
            }}
            className={`flex items-center gap-2 rounded-md border bg-white px-2 py-1.5 ${
              isOver ? "border-sky-500 ring-2 ring-sky-500/30" : "border-zinc-200"
            } ${dragIndex === index ? "opacity-50" : ""} ${section.visible ? "" : "bg-zinc-50"}`}
          >
            <span className="cursor-grab select-none px-1 text-zinc-400" aria-hidden title="Drag to reorder">
              &#x2630;
            </span>
            <label className="flex flex-1 cursor-pointer items-center gap-2 text-sm text-zinc-800">
              <input
                type="checkbox"
                className="h-4 w-4 accent-sky-600"
                checked={section.visible}
                onChange={() => toggle(index)}
                aria-label={`Show ${label}`}
              />
              <span className={section.visible ? "" : "text-zinc-400 line-through"}>{label}</span>
            </label>
            <button type="button" aria-label={`Move ${label} up`} className={iconButton} disabled={index === 0} onClick={() => move(index, index - 1)}>
              &uarr;
            </button>
            <button
              type="button"
              aria-label={`Move ${label} down`}
              className={iconButton}
              disabled={index === sections.length - 1}
              onClick={() => move(index, index + 1)}
            >
              &darr;
            </button>
          </li>
        );
      })}
    </ol>
  );
}
