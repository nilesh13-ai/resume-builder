"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { Resume } from "@/lib/types";
import { createLocalStore } from "./local";
import type { ResumeStore } from "./types";

const StoreContext = createContext<ResumeStore | null>(null);

export function ResumeStoreProvider({ children }: { children: React.ReactNode }) {
  const store = useMemo(() => createLocalStore(), []);
  return <StoreContext.Provider value={store}>{children}</StoreContext.Provider>;
}

export function useResumeStore(): ResumeStore {
  const store = useContext(StoreContext);
  if (!store) throw new Error("useResumeStore must be used inside ResumeStoreProvider");
  return store;
}

interface AsyncState<T> {
  value: T;
  loading: boolean;
  error: string | null;
}

/** All resumes, newest first. Refreshes whenever the store reports a change. */
export function useResumeList(): AsyncState<Resume[]> & { refresh: () => void } {
  const store = useResumeStore();
  const [state, setState] = useState<AsyncState<Resume[]>>({ value: [], loading: true, error: null });
  const [tick, setTick] = useState(0);

  useEffect(() => {
    let cancelled = false;
    store
      .list()
      .then((value) => !cancelled && setState({ value, loading: false, error: null }))
      .catch((e: unknown) => !cancelled && setState((s) => ({ ...s, loading: false, error: errorMessage(e) })));
    const unsubscribe = store.subscribe(() => setTick((t) => t + 1));
    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, [store, tick]);

  return { ...state, refresh: () => setTick((t) => t + 1) };
}

/** One resume by id. `value` is null while loading or when it does not exist. */
export function useResume(id: string): AsyncState<Resume | null> {
  const store = useResumeStore();
  const [state, setState] = useState<AsyncState<Resume | null>>({ value: null, loading: true, error: null });

  useEffect(() => {
    let cancelled = false;
    store
      .get(id)
      .then((value) => !cancelled && setState({ value, loading: false, error: null }))
      .catch((e: unknown) => !cancelled && setState({ value: null, loading: false, error: errorMessage(e) }));
    return () => {
      cancelled = true;
    };
  }, [store, id]);

  return state;
}

export function errorMessage(e: unknown): string {
  return e instanceof Error ? e.message : "Something went wrong";
}
