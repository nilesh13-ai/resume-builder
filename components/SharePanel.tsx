"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useToast } from "@/components/Toaster";
import { useAuth } from "@/lib/auth/context";
import { errorMessage, useResumeStore } from "@/lib/store/context";
import type { Resume } from "@/lib/types";

/**
 * "Share" button with a popover: a public toggle and a copyable link for
 * cloud resumes, or a login prompt for browser-only ones.
 */
export function SharePanel({ resume }: { resume: Resume }) {
  const store = useResumeStore();
  const { configured } = useAuth();
  const toast = useToast();
  const [open, setOpen] = useState(false);
  const [isPublic, setIsPublic] = useState(resume.isPublic);
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  // Close on outside click or Escape.
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const shareUrl = typeof window === "undefined" ? "" : `${window.location.origin}/r/${resume.id}`;

  async function setPublic(next: boolean) {
    setIsPublic(next); // optimistic
    setBusy(true);
    try {
      await store.update(resume.id, { isPublic: next });
      toast({ variant: "success", title: next ? "Resume is now public" : "Resume is private again" });
    } catch (e) {
      setIsPublic(!next);
      toast({ variant: "error", title: "Could not update sharing", description: errorMessage(e) });
    } finally {
      setBusy(false);
    }
  }

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast({ variant: "error", title: "Could not copy", description: "Select the link and copy it manually." });
    }
  }

  return (
    <div ref={panelRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-haspopup="dialog"
        className={`rounded-md border px-3 py-2 text-sm font-medium shadow-sm ${
          isPublic ? "border-emerald-300 bg-emerald-50 text-emerald-800 hover:bg-emerald-100" : "border-zinc-300 bg-white text-zinc-700 hover:bg-zinc-50"
        }`}
      >
        {isPublic ? "Public" : "Share"}
      </button>

      {open && (
        <div
          role="dialog"
          aria-label="Share resume"
          className="absolute right-0 z-20 mt-2 w-80 max-w-[calc(100vw-2rem)] rounded-lg border border-zinc-200 bg-white p-4 shadow-xl"
        >
          {store.kind !== "cloud" ? (
            <div>
              <p className="text-sm font-medium text-zinc-900">Log in to share</p>
              <p className="mt-1 text-sm text-zinc-600">
                {configured
                  ? "Public links need the resume saved to an account. Log in, import this resume, and share it from there."
                  : "Sharing needs an account, and sign-in is not configured on this deployment."}
              </p>
              {configured && (
                <Link href="/login" className="mt-3 inline-block rounded-md bg-zinc-900 px-3 py-2 text-sm font-medium text-white hover:bg-zinc-800">
                  Log in
                </Link>
              )}
            </div>
          ) : (
            <div>
              <label className="flex cursor-pointer items-center justify-between gap-3">
                <span>
                  <span className="block text-sm font-medium text-zinc-900">Make public</span>
                  <span className="block text-xs text-zinc-500">Anyone with the link can view and download it.</span>
                </span>
                <input
                  type="checkbox"
                  role="switch"
                  aria-checked={isPublic}
                  checked={isPublic}
                  disabled={busy}
                  onChange={(e) => setPublic(e.target.checked)}
                  className="h-5 w-5 shrink-0 accent-emerald-600"
                />
              </label>
              {isPublic && (
                <div className="mt-3">
                  <div className="flex gap-2">
                    <input
                      readOnly
                      aria-label="Public link"
                      value={shareUrl}
                      onFocus={(e) => e.target.select()}
                      className="min-w-0 flex-1 rounded-md border border-zinc-300 bg-zinc-50 px-2 py-1.5 text-xs text-zinc-700"
                    />
                    <button
                      type="button"
                      onClick={copyLink}
                      className="shrink-0 rounded-md bg-sky-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-sky-700"
                    >
                      {copied ? "Copied" : "Copy link"}
                    </button>
                  </div>
                  <a href={shareUrl} target="_blank" rel="noreferrer" className="mt-2 inline-block text-xs text-sky-700 hover:underline">
                    Open public page
                  </a>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
