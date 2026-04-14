"use client";

import { useActionState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { resetPassword } from "@/lib/actions/auth";
import { authInputClass, formLabelClass } from "@/lib/form-classes";
import { ErrorBanner } from "@/components/error-banner";
import { cn } from "@/lib/utils";

export function ResetPasswordForm({ token }: { token?: string }) {
  const router = useRouter();
  const [state, formAction] = useActionState(
    async (_: unknown, formData: FormData) => {
      const result = await resetPassword(formData);
      if (result.ok) router.push("/login?reset=1");
      return result;
    },
    null as null | { ok?: boolean; error?: string }
  );

  if (!token) {
    return (
      <div className="space-y-4">
        <ErrorBanner message="Invalid or expired reset link. Request a new one from the forgot password page." />
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
    <form action={formAction} className="space-y-4">
      {state?.error && (
        <ErrorBanner message={state.error} />
      )}
      <input type="hidden" name="token" value={token} />
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
          className={authInputClass}
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
          className={authInputClass}
        />
      </div>
      <button
        type="submit"
        className="w-full h-10 bg-primary hover:bg-primary/90 text-white font-semibold rounded-[6px] transition-colors text-sm shadow-sm disabled:opacity-50"
      >
        Set password
      </button>
    </form>
  );
}
