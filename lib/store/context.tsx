"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { useAuth } from "@/lib/auth/context";
import { getBrowserSupabase } from "@/lib/supabase/client";
import type { Resume } from "@/lib/types";
import { createCloudStore } from "./cloud";
import { createLocalStore } from "./local";
import type { ResumeStore } from "./types";

interface StoreContextValue {
  /** The active store: cloud when logged in, local otherwise. */
  store: ResumeStore;
  /** Always the browser-local store, used to offer importing into an account. */
  localStore: ResumeStore;
  /** False while the auth session is still being read; hooks report loading until then. */
  ready: boolean;
}

const StoreContext = createContext<StoreContextValue | null>(null);

export function ResumeStoreProvider({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const localStore = useMemo(() => createLocalStore(), []);
  const userId = user?.id ?? null;
  const store = useMemo(() => {
    const supabase = getBrowserSupabase();
    return userId && supabase ? createCloudStore(supabase, userId) : localStore;
  }, [userId, localStore]);

  return (
    <StoreContext.Provider value={{ store, localStore, ready: !loading }}>{children}</StoreContext.Provider>
  );
}

function useStoreContext(): StoreContextValue {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useResumeStore must be used inside ResumeStoreProvider");
  return ctx;
}

export function useResumeStore(): ResumeStore {
  return useStoreContext().store;
}

export function useLocalResumeStore(): ResumeStore {
  return useStoreContext().localStore;
}

interface AsyncState<T> {
  value: T;
  loading: boolean;
  error: string | null;
}

/** All resumes, newest first. Refreshes whenever the store reports a change. */
export function useResumeList(): AsyncState<Resume[]> & { refresh: () => void } {
  const { store, ready } = useStoreContext();
  const [state, setState] = useState<AsyncState<Resume[]>>({ value: [], loading: true, error: null });
  const [tick, setTick] = useState(0);

  useEffect(() => {
    if (!ready) return;
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
  }, [store, ready, tick]);

  return { ...state, loading: state.loading || !ready, refresh: () => setTick((t) => t + 1) };
}

/** One resume by id. `value` is null while loading or when it does not exist. */
export function useResume(id: string): AsyncState<Resume | null> & { refresh: () => void } {
  const { store, ready } = useStoreContext();
  const [state, setState] = useState<AsyncState<Resume | null>>({ value: null, loading: true, error: null });
  const [tick, setTick] = useState(0);

  useEffect(() => {
    if (!ready) return;
    let cancelled = false;
    store
      .get(id)
      .then((value) => !cancelled && setState({ value, loading: false, error: null }))
      .catch((e: unknown) => !cancelled && setState({ value: null, loading: false, error: errorMessage(e) }));
    return () => {
      cancelled = true;
    };
  }, [store, ready, id, tick]);

  return { ...state, loading: state.loading || !ready, refresh: () => setTick((t) => t + 1) };
}

export function errorMessage(e: unknown): string {
  return e instanceof Error ? e.message : "Something went wrong";
}
