"use client";

import { useActionState } from "react";
import { signUp } from "@/lib/actions/auth";
import { authInputClass, formLabelClass } from "@/lib/form-classes";
import { ErrorBanner } from "@/components/error-banner";
import { cn } from "@/lib/utils";
import type { ActionError } from "@/lib/actions/action-result";

export function SignUpForm() {
  const [state, formAction] = useActionState(
    async (_: unknown, formData: FormData) => {
      return await signUp(formData);
    },
    null as ActionError | null
  );

  return (
    <form action={formAction} className="space-y-4">
      {state?.error && (
        <ErrorBanner message={state.error} />
      )}
      <div className="flex flex-col gap-1.5">
        <label
          className={cn(formLabelClass, "mb-0")}
          htmlFor="email"
        >
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
      <div className="flex flex-col gap-1.5">
        <label
          className={cn(formLabelClass, "mb-0")}
          htmlFor="password"
        >
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          placeholder="••••••••"
          required
          autoComplete="new-password"
          minLength={6}
          className={authInputClass}
        />
        <p className="text-xs text-slate-500">At least 6 characters</p>
      </div>
      <button
        type="submit"
        className="w-full h-10 bg-primary hover:bg-primary/90 text-white font-semibold rounded-[6px] transition-colors text-sm shadow-sm"
      >
        Sign up
      </button>
    </form>
  );
}
