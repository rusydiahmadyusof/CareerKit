"use client";

import { useActionState } from "react";
import { requestPasswordReset } from "@/lib/actions/auth";
import { authInputClass, formLabelClass } from "@/lib/form-classes";
import { ErrorBanner } from "@/components/error-banner";
import { cn } from "@/lib/utils";

export function ForgotPasswordForm() {
  const [state, formAction] = useActionState(
    async (_: unknown, formData: FormData) => requestPasswordReset(formData),
    null as null | { ok?: boolean; error?: string; resetLink?: string }
  );

  if (state?.ok) {
    return (
      <div className="rounded-md bg-emerald-50 border border-emerald-200 px-4 py-3 text-sm text-emerald-800 space-y-2" role="status">
        <p>If the email exists, a reset link is ready.</p>
        {state.resetLink && (
          <p>
            Reset link: <a className="underline" href={state.resetLink}>{state.resetLink}</a>
          </p>
        )}
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-4">
      {state?.error && (
        <ErrorBanner message={state.error} />
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
          className={authInputClass}
        />
      </div>
      <button
        type="submit"
        className="w-full h-10 bg-primary hover:bg-primary/90 text-white font-semibold rounded-[6px] transition-colors text-sm shadow-sm disabled:opacity-50"
      >
        Send reset link
      </button>
    </form>
  );
}
