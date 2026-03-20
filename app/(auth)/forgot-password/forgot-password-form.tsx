"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { authInputClass, formLabelClass } from "@/lib/form-classes";
import { ErrorBanner } from "@/components/error-banner";
import { cn } from "@/lib/utils";

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email?.trim()) {
      setStatus("error");
      setMessage("Please enter your email.");
      return;
    }
    setStatus("loading");
    setMessage("");
    const supabase = createClient();
    const baseUrl = typeof window !== "undefined" ? window.location.origin : "";
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${baseUrl}/reset-password`,
    });
    if (error) {
      setStatus("error");
      setMessage(error.message);
      return;
    }
    setStatus("success");
    setMessage("Check your email for a link to reset your password.");
  }

  if (status === "success") {
    return (
      <div className="rounded-md bg-emerald-50 border border-emerald-200 px-4 py-3 text-sm text-emerald-800" role="status">
        {message}
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {status === "error" && message && (
        <ErrorBanner message={message} />
      )}
      <div className="flex flex-col gap-1.5">
        <label className={cn(formLabelClass, "mb-0")} htmlFor="email">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          placeholder="name@company.com"
          required
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={authInputClass}
          disabled={status === "loading"}
        />
      </div>
      <button
        type="submit"
        disabled={status === "loading"}
        className="w-full h-10 bg-primary hover:bg-primary/90 text-white font-semibold rounded-[6px] transition-colors text-sm shadow-sm disabled:opacity-50"
      >
        {status === "loading" ? "Sending…" : "Send reset link"}
      </button>
    </form>
  );
}
