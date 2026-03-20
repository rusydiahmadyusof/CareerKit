import Link from "next/link";
import { Briefcase } from "lucide-react";
import { ForgotPasswordForm } from "./forgot-password-form";

export const metadata = {
  title: "Forgot password — CareerKit",
  description: "Reset your CareerKit password.",
};

export default function ForgotPasswordPage() {
  return (
    <div className="w-full max-w-[400px] p-8 bg-white border border-slate-200 rounded-lg shadow-sm">
      <div className="flex flex-col items-center mb-6">
        <Link
          href="/"
          className="flex items-center gap-2 mb-4 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded"
        >
          <Briefcase className="h-6 w-6 text-primary" aria-hidden />
          <span className="text-slate-900 text-lg font-bold tracking-tight">CareerKit</span>
        </Link>
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-slate-900 mb-1">Forgot password?</h1>
          <p className="text-sm text-slate-500">
            Enter your email and we&apos;ll send you a link to reset your password.
          </p>
        </div>
      </div>
      <ForgotPasswordForm />
      <p className="mt-6 text-center text-sm text-slate-500">
        <Link href="/login" className="text-primary font-medium hover:underline">
          ← Back to log in
        </Link>
      </p>
    </div>
  );
}
