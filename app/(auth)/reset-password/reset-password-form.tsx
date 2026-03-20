"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { authInputClass, formLabelClass } from "@/lib/form-classes";
import { ErrorBanner } from "@/components/error-banner";
import { cn } from "@/lib/utils";

export function ResetPasswordForm() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setReady(true);
      } else {
        setReady(true);
        setStatus("error");
        setMessage("Invalid or expired reset link. Request a new one from the forgot password page.");
      }
    });
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage("");
    if (password.length < 6) {
      setStatus("error");
      setMessage("Password must be at least 6 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setStatus("error");
      setMessage("Passwords do not match.");
      return;
    }
    setStatus("loading");
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password });
    if (error) {
      setStatus("error");
      setMessage(error.message);
      return;
    }
    setStatus("success");
    await supabase.auth.signOut();
    router.push("/login?reset=1");
  }

  if (!ready) {
    return (
      <p className="text-sm text-slate-500">Checking link…</p>
    );
  }

  if (status === "error" && message && message.includes("Invalid or expired")) {
    return (
      <div className="space-y-4">
        <ErrorBanner message={message} />
        <Link
          href="/forgot-password"
          className="inline-block w-full text-center h-10 leading-10 bg-primary hover:bg-primary/90 text-white font-semibold rounded-[6px] text-sm"
        >
          Request new link
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {status === "error" && message && (
        <ErrorBanner message={message} />
      )}
      <div className="flex flex-col gap-1.5">
        <label className={cn(formLabelClass, "mb-0")} htmlFor="password">
          New password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          placeholder="••••••••"
          required
          minLength={6}
          autoComplete="new-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className={authInputClass}
          disabled={status === "loading"}
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <label className={cn(formLabelClass, "mb-0")} htmlFor="confirm_password">
          Confirm password
        </label>
        <input
          id="confirm_password"
          name="confirm_password"
          type="password"
          placeholder="••••••••"
          required
          minLength={6}
          autoComplete="new-password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className={authInputClass}
          disabled={status === "loading"}
        />
      </div>
      <button
        type="submit"
        disabled={status === "loading"}
        className="w-full h-10 bg-primary hover:bg-primary/90 text-white font-semibold rounded-[6px] transition-colors text-sm shadow-sm disabled:opacity-50"
      >
        {status === "loading" ? "Saving…" : "Set password"}
      </button>
    </form>
  );
}
