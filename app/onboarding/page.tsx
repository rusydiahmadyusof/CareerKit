import { requireAuthedUser } from "@/lib/auth/guards";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Briefcase } from "lucide-react";
import { getProfile, isOnboardingComplete, skipOnboarding } from "@/lib/actions/profile";
import { ProfileForm } from "@/components/profile-form";

export default async function OnboardingPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const user = await requireAuthedUser();

  if (await isOnboardingComplete()) {
    redirect("/dashboard");
  }

  const profile = await getProfile();
  const { error: errorParam } = await searchParams;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-4">
      <div className="w-full max-w-[640px] rounded-lg border border-slate-200 bg-white p-8 shadow-sm">
        {errorParam && (
          <p className="mb-6 rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {decodeURIComponent(errorParam)}
          </p>
        )}
        <div className="mb-8 flex flex-col items-center">
          <Link
            href="/"
            className="flex items-center gap-2 mb-4 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded"
          >
            <Briefcase className="h-6 w-6 text-primary" aria-hidden />
            <span className="text-lg font-bold tracking-tight text-slate-900">
              CareerKit
            </span>
          </Link>
          <h1 className="text-2xl font-semibold text-slate-900 mb-1">
            Welcome — tell us about you
          </h1>
          <p className="text-sm text-slate-500 text-center max-w-md">
            This info will help us tailor your resumes. You can update it anytime from your profile.
          </p>
        </div>
        <ProfileForm
          profile={profile}
          userEmail={user.email}
          onSuccessRedirect="/dashboard"
          submitLabel="Complete setup"
        />
        <div className="mt-6 flex justify-center">
          <form action={skipOnboarding}>
            <button
              type="submit"
              className="text-sm text-slate-500 hover:text-slate-700 underline underline-offset-2 transition-colors"
            >
              Skip for now
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
