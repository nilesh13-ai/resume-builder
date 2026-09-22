import { Suspense } from "react";
import { LoginForm } from "@/components/LoginForm";

export const metadata = { title: "Log in" };

export default function LoginPage() {
  return (
    <div className="mx-auto w-full max-w-md px-4 py-16">
      <Suspense fallback={<div className="h-64 animate-pulse rounded-xl bg-zinc-200" aria-busy />}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
