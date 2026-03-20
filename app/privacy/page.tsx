import Link from "next/link";
import { Briefcase } from "lucide-react";

export const metadata = {
  title: "Privacy Policy — CareerKit",
  description: "Privacy policy for CareerKit.",
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-[#221610] text-slate-900 dark:text-slate-100">
      <header className="border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
        <div className="mx-auto flex h-16 max-w-3xl items-center justify-between px-6">
          <Link href="/" className="flex items-center gap-2 text-slate-900 dark:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded">
            <Briefcase className="h-8 w-8 text-primary" aria-hidden />
            <span className="text-xl font-semibold tracking-tight">CareerKit</span>
          </Link>
          <Link href="/" className="text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-primary transition-colors">
            Home
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-6 py-12">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Privacy Policy</h1>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Last updated: March 2025</p>

        <div className="mt-8 space-y-6 text-sm text-slate-700 dark:text-slate-300">
          <section>
            <h2 className="text-base font-semibold text-slate-900 dark:text-white">What we collect</h2>
            <p className="mt-2">
              CareerKit stores the data you provide: account credentials (email, hashed password), profile info,
              resumes you create, and job applications you track. We do not sell your data.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-slate-900 dark:text-white">How we use it</h2>
            <p className="mt-2">
              Your data is used only to run the service: sign-in, saving and editing profile and resumes,
              tailor-to-job and ATS features when you use them, and export or print.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-slate-900 dark:text-white">Where it is stored</h2>
            <p className="mt-2">
              Data is stored on Supabase. AI features may use third-party APIs. See your deployment and Supabase
              config for region and subprocessors.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-slate-900 dark:text-white">Your rights</h2>
            <p className="mt-2">
              You can update or delete your profile and data in the app. You may request account deletion.
              In the EEA/UK you have additional rights under applicable law.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-slate-900 dark:text-white">Contact</h2>
            <p className="mt-2">
              For privacy questions, use the Contact link on our site or the contact method where you use CareerKit.
            </p>
          </section>
        </div>

        <p className="mt-10">
          <Link href="/" className="text-sm font-medium text-primary hover:underline">
            ← Back to home
          </Link>
        </p>
      </main>
    </div>
  );
}
