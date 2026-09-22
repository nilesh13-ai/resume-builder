"use client";

import type { User } from "@supabase/supabase-js";
import { createContext, useContext, useEffect, useState } from "react";
import { getBrowserSupabase } from "@/lib/supabase/client";
import { supabaseConfigured } from "@/lib/supabase/env";

interface AuthState {
  /** False when the Supabase env vars are missing; the app then runs local-only. */
  configured: boolean;
  /** True until the initial session has been read from storage. */
  loading: boolean;
  user: User | null;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<{ loading: boolean; user: User | null }>({
    loading: supabaseConfigured,
    user: null,
  });

  useEffect(() => {
    const supabase = getBrowserSupabase();
    if (!supabase) return;
    // Fires INITIAL_SESSION immediately, then on every sign-in/out/refresh.
    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      setState({ loading: false, user: session?.user ?? null });
    });
    return () => data.subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    const supabase = getBrowserSupabase();
    if (supabase) await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ configured: supabaseConfigured, ...state, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
