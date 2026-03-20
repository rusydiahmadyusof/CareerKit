"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

const MESSAGE = "Account created. Sign in with your email and password.";

export function RegisteredToast() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (searchParams.get("registered") === "1") {
      setShow(true);
      const url = new URL(window.location.href);
      url.searchParams.delete("registered");
      router.replace(url.pathname + url.search, { scroll: false });
    }
  }, [searchParams, router]);

  useEffect(() => {
    if (!show) return;
    const t = setTimeout(() => setShow(false), 5000);
    return () => clearTimeout(t);
  }, [show]);

  if (!show) return null;

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
      <span>{MESSAGE}</span>
      <button
        type="button"
        onClick={() => setShow(false)}
        className="ml-auto rounded p-1 hover:bg-primary/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        aria-label="Dismiss"
      >
        <span className="sr-only">Dismiss</span>
        <span aria-hidden>×</span>
      </button>
    </div>
  );
}
