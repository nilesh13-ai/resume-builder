"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth/context";
import { errorMessage, useLocalResumeStore, useResumeStore } from "@/lib/store/context";
import { DuplicateResumeError } from "@/lib/store/types";
import type { Resume } from "@/lib/types";

const dismissKey = (userId: string) => `resume-builder:import-dismissed:${userId}`;

/**
 * Shown on the dashboard after login when this browser still holds local
 * resumes. Importing copies them into the account (keeping their ids, so a
 * retry can never create a duplicate) and then removes the local copies.
 */
export function ImportLocalPrompt({ onImported }: { onImported: () => void }) {
  const { user } = useAuth();
  const cloud = useResumeStore();
  const local = useLocalResumeStore();
  const [pending, setPending] = useState<Resume[] | null>(null);
  const [state, setState] = useState<"idle" | "importing" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (cloud.kind !== "cloud" || !user) return;
    let cancelled = false;
    let dismissed = false;
    try {
      dismissed = window.localStorage.getItem(dismissKey(user.id)) === "1";
    } catch {
      // Storage unavailable; behave as if nothing is dismissed.
    }
    if (dismissed) return;
    local
      .list()
      .then((resumes) => !cancelled && setPending(resumes))
      .catch(() => !cancelled && setPending([]));
    return () => {
      cancelled = true;
    };
  }, [cloud, local, user]);

  if (!user || cloud.kind !== "cloud" || !pending || pending.length === 0) return null;

  const dismiss = () => {
    try {
      window.localStorage.setItem(dismissKey(user.id), "1");
    } catch {
      // Ignore; the prompt simply shows again next time.
    }
    setPending([]);
  };

  async function importAll() {
    if (!pending) return;
    setState("importing");
    setError(null);
    const remaining = [...pending];
    try {
      for (const resume of pending) {
        try {
          await cloud.create({ id: resume.id, title: resume.title, templateId: resume.templateId, data: resume.data });
        } catch (e) {
          // Already imported on a previous attempt: just clean up the local copy.
          if (!(e instanceof DuplicateResumeError)) throw e;
        }
        await local.remove(resume.id);
        remaining.shift();
      }
      setPending([]);
      setState("idle");
      onImported();
    } catch (e) {
      setPending(remaining);
      setState("error");
      setError(errorMessage(e));
    }
  }

  const count = pending.length;
  return (
    <div role="region" aria-label="Import local resumes" className="mb-6 rounded-xl border border-sky-200 bg-sky-50 p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="font-medium text-sky-900">
            {count === 1 ? "1 resume is" : `${count} resumes are`} saved only in this browser.
          </p>
          <p className="mt-0.5 text-sm text-sky-800">
            Import {count === 1 ? "it" : "them"} into your account so {count === 1 ? "it's" : "they're"} available on every device.
          </p>
          {error && (
            <p role="alert" className="mt-2 text-sm text-red-700">
              Import failed: {error}. You can try again; nothing will be duplicated.
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={importAll}
            disabled={state === "importing"}
            className="rounded-md bg-sky-600 px-3.5 py-2 text-sm font-medium text-white hover:bg-sky-700 disabled:opacity-60"
          >
            {state === "importing" ? "Importing…" : `Import ${count === 1 ? "resume" : `${count} resumes`}`}
          </button>
          <button
            type="button"
            onClick={dismiss}
            disabled={state === "importing"}
            className="rounded-md px-3 py-2 text-sm font-medium text-sky-800 hover:bg-sky-100"
          >
            Not now
          </button>
        </div>
      </div>
    </div>
  );
}
