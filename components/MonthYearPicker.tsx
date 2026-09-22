"use client";

import { useState } from "react";
import { MONTHS } from "@/lib/format";

const CURRENT_YEAR = new Date().getFullYear();
/** Newest first, so recent years are at the top of the list. */
const YEARS: string[] = Array.from(
  { length: CURRENT_YEAR + 2 - 1965 + 1 },
  (_, i) => String(CURRENT_YEAR + 2 - i),
);

const selectClass =
  "w-full appearance-none rounded-md border border-zinc-300 bg-white px-3 py-2 pr-8 text-base text-zinc-900 shadow-sm focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/30 disabled:bg-zinc-100 disabled:text-zinc-400 md:text-sm";

function Chevron() {
  return (
    <svg
      viewBox="0 0 16 16"
      className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      aria-hidden
    >
      <path d="M4 6l4 4 4-4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function YearSelect({
  value,
  onChange,
  disabled,
  label = "Year",
}: {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  label?: string;
}) {
  // Keep a stored year that is outside the generated range selectable.
  const options = value && !YEARS.includes(value) ? [value, ...YEARS] : YEARS;
  return (
    <span className="relative block">
      <select
        className={selectClass}
        value={value}
        disabled={disabled}
        aria-label={label}
        onChange={(e) => onChange(e.target.value)}
      >
        <option value="">{label}</option>
        {options.map((y) => (
          <option key={y} value={y}>
            {y}
          </option>
        ))}
      </select>
      <Chevron />
    </span>
  );
}

function split(value: string): { month: string; year: string } {
  const match = /^(\d{4})-(\d{2})$/.exec(value);
  return match ? { year: match[1], month: match[2] } : { month: "", year: "" };
}

/**
 * Month + year selects producing a "YYYY-MM" value. While only one half is
 * chosen the value reported upwards is "" and the chosen half is kept locally.
 */
export function MonthYearPicker({
  value,
  onChange,
  disabled,
  label,
}: {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  /** Field name used to build the accessible names, e.g. "Start date" -> "Start date month". */
  label: string;
}) {
  const [parts, setParts] = useState(() => split(value));
  const [prevValue, setPrevValue] = useState(value);
  if (value !== prevValue) {
    // Value changed from outside (e.g. "Clear all"); adopt it unless it is just our own partial "".
    setPrevValue(value);
    if (value !== "") setParts(split(value));
  }
  const shown = disabled ? split(value) : parts;

  const update = (next: { month: string; year: string }) => {
    setParts(next);
    onChange(next.month && next.year ? `${next.year}-${next.month}` : "");
  };

  return (
    <div className="grid grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)] gap-2">
      <span className="relative block">
        <select
          className={selectClass}
          value={shown.month}
          disabled={disabled}
          aria-label={`${label} month`}
          onChange={(e) => update({ ...shown, month: e.target.value })}
        >
          <option value="">Month</option>
          {MONTHS.map((name, i) => {
            const mm = String(i + 1).padStart(2, "0");
            return (
              <option key={mm} value={mm}>
                {name}
              </option>
            );
          })}
        </select>
        <Chevron />
      </span>
      <YearSelect
        value={shown.year}
        disabled={disabled}
        label={`${label} year`}
        onChange={(year) => update({ ...shown, year })}
      />
    </div>
  );
}
