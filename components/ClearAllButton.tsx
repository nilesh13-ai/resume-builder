"use client";

import { useState } from "react";

/** "Clear all" with an inline confirm step. */
export function ClearAllButton({ onConfirm }: { onConfirm: () => void }) {
  const [confirming, setConfirming] = useState(false);

  if (!confirming) {
    return (
      <button
        type="button"
        onClick={() => setConfirming(true)}
        className="rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm font-medium text-zinc-700 shadow-sm hover:bg-zinc-50"
      >
        Clear all
      </button>
    );
  }

  return (
    <div
      role="alertdialog"
      aria-label="Confirm clear all"
      className="flex items-center gap-2 rounded-md border border-red-200 bg-red-50 px-2.5 py-1.5 text-sm"
    >
      <span className="text-red-800">Reset to sample data?</span>
      <button
        type="button"
        autoFocus
        onClick={() => {
          setConfirming(false);
          onConfirm();
        }}
        className="rounded bg-red-600 px-2.5 py-1.5 text-xs font-medium text-white hover:bg-red-700"
      >
        Reset
      </button>
      <button
        type="button"
        onClick={() => setConfirming(false)}
        className="rounded px-2 py-1.5 text-xs font-medium text-zinc-600 hover:bg-white"
      >
        Cancel
      </button>
    </div>
  );
}
