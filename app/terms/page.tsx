import Link from "next/link";
import { Briefcase } from "lucide-react";

export const metadata = {
  title: "Terms of Use — CareerKit",
  description: "Terms of use for CareerKit.",
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-[#221610] text-slate-900 dark:text-slate-100">
      <header className="border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
        <div className="mx-auto flex h-16 max-w-3xl items-center justify-between px-6">
          <Link
            href="/"
            className="flex items-center gap-2 text-slate-900 dark:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded"
          >
            <Briefcase className="h-8 w-8 text-primary" aria-hidden />
            <span className="text-xl font-semibold tracking-tight">CareerKit</span>
          </Link>
          <Link
            href="/"
            className="text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-primary transition-colors"
          >
            Home
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-6 py-12">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Terms of Use</h1>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Last updated: March 2025</p>

        <div className="mt-8 space-y-6 text-sm text-slate-700 dark:text-slate-300">
          <section>
            <h2 className="text-base font-semibold text-slate-900 dark:text-white">Acceptance</h2>
            <p className="mt-2">
              By using CareerKit you agree to these terms. If you do not agree, do not use the service.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-slate-900 dark:text-white">Use of the service</h2>
            <p className="mt-2">
              You may use CareerKit to create and manage resumes and track job applications. You are responsible for
              the accuracy of your data and for keeping your account secure. Do not misuse the service, attempt to
              access other users’ data, or use it for any illegal purpose.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-slate-900 dark:text-white">Intellectual property</h2>
            <p className="mt-2">
              You keep ownership of the content you add. By using the service you grant us the rights needed to
              operate it (e.g. storing and displaying your data). CareerKit’s name, branding, and software remain the
              property of the operator.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-slate-900 dark:text-white">Disclaimer</h2>
            <p className="mt-2">
              CareerKit is provided “as is.” We do not guarantee uninterrupted or error-free service. We are not
              liable for decisions you make based on resume or application data or on any AI-generated content.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-slate-900 dark:text-white">Changes and contact</h2>
            <p className="mt-2">
              We may update these terms; continued use after changes means you accept them. For questions, use the{" "}
              <Link href="/" className="text-primary font-medium hover:underline">
                Contact
              </Link>{" "}
              link on our site.
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
