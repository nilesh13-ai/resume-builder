"use client";

import { useSyncExternalStore } from "react";
import { ResumeEditor } from "@/components/ResumeEditor";
import { sampleResume } from "@/lib/sample-data";
import { loadStoredState, type StoredState } from "@/lib/storage";

const DEFAULT_STATE: StoredState = { data: sampleResume, template: "classic" };

const subscribeNoop = () => () => {};

export default function Home() {
  // false during prerender and hydration, true afterwards, without a setState-in-effect.
  const isClient = useSyncExternalStore(subscribeNoop, () => true, () => false);

  if (!isClient) {
    return <ResumeEditor key="prerender" initial={DEFAULT_STATE} persist={false} />;
  }

  // Remounts once with whatever the browser has saved (or the sample data).
  return (
    <ResumeEditor key="client" initial={loadStoredState() ?? DEFAULT_STATE} persist />
  );
}
