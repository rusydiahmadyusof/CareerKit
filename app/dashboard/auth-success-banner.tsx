"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

type WelcomeType = "login" | "signup";

const messages: Record<WelcomeType, string> = {
  login: "You're signed in successfully.",
  signup: "Account created. You're signed in.",
};

export function AuthSuccessBanner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [welcomeType, setWelcomeType] = useState<WelcomeType | null>(null);

  useEffect(() => {
    const welcome = searchParams.get("welcome");
    if (welcome === "login" || welcome === "signup") {
      setWelcomeType(welcome);
      const url = new URL(window.location.href);
      url.searchParams.delete("welcome");
      router.replace(url.pathname + url.search, { scroll: false });
    }
  }, [searchParams, router]);

  useEffect(() => {
    if (!welcomeType) return;
    const t = setTimeout(() => setWelcomeType(null), 5000);
    return () => clearTimeout(t);
  }, [welcomeType]);

  if (!welcomeType) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        "fixed bottom-4 right-4 z-50",
        "flex items-center gap-2 rounded-lg border border-primary/20 bg-card px-4 py-3 text-sm text-card-foreground shadow-lg",
        "transition-opacity duration-200"
      )}
    >
      <CheckCircle2 className="size-5 shrink-0 text-primary" aria-hidden />
      <span>{messages[welcomeType]}</span>
      <button
        type="button"
        onClick={() => setWelcomeType(null)}
        className="ml-auto rounded p-1 hover:bg-primary/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        aria-label="Dismiss"
      >
        <span className="sr-only">Dismiss</span>
        <span aria-hidden>×</span>
      </button>
    </div>
  );
}
