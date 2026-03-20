import Link from "next/link";
import { Suspense } from "react";
import { cookies } from "next/headers";
import { Briefcase } from "lucide-react";
import { LoginForm } from "./login-form";
import { RegisteredToast } from "./registered-toast";

const REMEMBER_EMAIL_COOKIE = "remember_email";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ registered?: string; reset?: string }>;
}) {
  const params = await searchParams;
  const cookieStore = await cookies();
  const rememberEmail = cookieStore.get(REMEMBER_EMAIL_COOKIE)?.value ?? "";
  return (
    <>
      <Suspense fallback={null}>
        <RegisteredToast />
      </Suspense>
      <div className="w-full max-w-[400px] p-8 bg-white border border-slate-200 rounded-lg shadow-sm">
        {params.reset === "1" && (
          <p className="mb-4 rounded-md bg-emerald-50 border border-emerald-200 px-3 py-2 text-sm text-emerald-800" role="status">
            Your password has been reset. You can log in with your new password.
          </p>
        )}
        <div className="flex flex-col items-center mb-6">
          <Link
            href="/"
            className="flex items-center gap-2 mb-4 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded"
          >
            <Briefcase className="h-6 w-6 text-primary" aria-hidden />
            <span className="text-slate-900 text-lg font-bold tracking-tight">
              CareerKit
            </span>
          </Link>
          <div className="text-center">
            <h1 className="text-2xl font-semibold text-slate-900 mb-1">
              Log in
            </h1>
            <p className="text-sm text-slate-500">
              Enter your email and password.
            </p>
          </div>
        </div>
        <LoginForm initialEmail={rememberEmail} />
        <div className="mt-6 flex flex-col items-center gap-2">
          <Link
            href="/forgot-password"
            className="text-sm text-slate-500 hover:text-slate-700 transition-colors"
          >
            Forgot password?
          </Link>
          <p className="text-sm text-slate-500">
            Don&apos;t have an account?{" "}
            <Link
              href="/signup"
              className="text-primary font-medium hover:underline"
            >
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </>
  );
}
