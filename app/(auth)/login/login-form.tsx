"use client";

import { useActionState } from "react";
import { signIn } from "@/lib/actions/auth";
import { authInputClass, formLabelClass } from "@/lib/form-classes";
import { ErrorBanner } from "@/components/error-banner";
import { cn } from "@/lib/utils";
import type { ActionError } from "@/lib/actions/action-result";

export function LoginForm({ initialEmail = "" }: { initialEmail?: string }) {
  const [state, formAction] = useActionState(
    async (_: unknown, formData: FormData) => {
      return await signIn(formData);
    },
    null as ActionError | null
  );

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
          defaultValue={initialEmail}
          className={authInputClass}
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <label className={cn(formLabelClass, "mb-0")} htmlFor="password">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          placeholder="••••••••"
          required
          autoComplete="current-password"
          className={authInputClass}
        />
      </div>
      <div className="flex items-center gap-2">
        <input
          id="remember_me"
          name="remember_me"
          type="checkbox"
          value="1"
          defaultChecked={true}
          className="h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary/20"
        />
        <label htmlFor="remember_me" className="text-sm text-slate-600 cursor-pointer select-none">
          Remember me
        </label>
      </div>
      <button
        type="submit"
        className="w-full h-10 bg-primary hover:bg-primary/90 text-white font-semibold rounded-[6px] transition-colors text-sm shadow-sm"
      >
        Log in
      </button>
    </form>
  );
}
