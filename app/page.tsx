import Link from "next/link";
import { getCurrentUser } from "@/lib/auth/session";
import { Briefcase, FileText, LayoutGrid, BarChart3 } from "lucide-react";
import { Public_Sans } from "next/font/google";

export const metadata = {
  title: "CareerKit - Resumes and Applications, Together",
  description: "Build and track in one place. Multiple resumes. Clear pipeline.",
};

const publicSans = Public_Sans({
  subsets: ["latin"],
  weight: ["400", "600", "700", "900"],
});

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ deleted?: string; reset?: string }>;
}) {
  const user = await getCurrentUser();
  const params = await searchParams;
  const showDeleted = params.deleted === "1";
  const showReset = params.reset === "1";

  return (
    <div
      className={`${publicSans.className} min-h-screen flex flex-col bg-[#f8fafc] dark:bg-[#221610] text-slate-900 dark:text-slate-100`}
    >
      {showDeleted && (
        <div className="bg-emerald-50 dark:bg-emerald-900/20 border-b border-emerald-200 dark:border-emerald-800 px-6 py-3 text-center text-sm text-emerald-800 dark:text-emerald-200" role="status">
          Your account and data have been deleted.
        </div>
      )}
      {showReset && !user && (
        <div className="bg-emerald-50 dark:bg-emerald-900/20 border-b border-emerald-200 dark:border-emerald-800 px-6 py-3 text-center text-sm text-emerald-800 dark:text-emerald-200" role="status">
          Your password has been reset. You can log in now.
        </div>
      )}
      {/* Header */}
      <header className="h-16 flex items-center justify-between px-6 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-50">
        <Link href="/" className="flex items-center gap-2">
          <Briefcase className="h-8 w-8 text-primary" aria-hidden />
          <span className="text-xl font-semibold tracking-tight text-slate-900 dark:text-white">
            CareerKit
          </span>
        </Link>
        <div className="flex items-center gap-6">
          {user ? (
            <Link
              href="/dashboard"
              className="h-10 px-4 flex items-center bg-primary hover:bg-primary/90 text-white rounded-lg text-sm font-semibold transition-all"
            >
              Dashboard
            </Link>
          ) : (
            <>
              <Link
                href="/login"
                className="text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-primary transition-colors"
              >
                Log in
              </Link>
              <Link
                href="/signup"
                className="h-10 px-4 flex items-center bg-primary hover:bg-primary/90 text-white rounded-lg text-sm font-semibold transition-all"
              >
                Sign up
              </Link>
            </>
          )}
        </div>
      </header>

      {/* Main */}
      <main className="flex-grow flex flex-col items-center justify-start pt-20 px-6 sm:px-12">
        <div className="w-full max-w-[640px] text-center">
          {/* Hero */}
          <div className="mb-12">
            <h1 className="text-3xl md:text-[36px] font-bold leading-tight text-slate-900 dark:text-white mb-4">
              Your resumes and applications, together
            </h1>
            <p className="text-lg text-slate-600 dark:text-slate-400 mb-8 font-normal">
              Build and track in one place. Multiple resumes. Clear pipeline.
            </p>
            {!user && (
              <div className="flex items-center justify-center gap-3">
                <Link
                  href="/signup"
                  className="h-10 px-6 inline-flex items-center justify-center bg-primary hover:bg-primary/90 text-white rounded-lg text-sm font-semibold transition-all"
                >
                  Sign up
                </Link>
                <Link
                  href="/login"
                  className="h-10 px-6 inline-flex items-center justify-center bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg text-sm font-semibold transition-all"
                >
                  Log in
                </Link>
              </div>
            )}
          </div>

          {/* Dashboard Mockup */}
          <div
            className="relative w-full aspect-video rounded-xl overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-800"
            role="img"
            aria-label="Clean SaaS dashboard interface showing job application tracking pipeline"
          >
            <div
              className="absolute inset-0 bg-cover bg-center bg-no-repeat"
              style={{
                backgroundImage: `url('https://lh3.googleusercontent.com/aida-public/AB6AXuBgOXK34Z6UZ8QXBAbSamEdcVIl07DhQXtVgpP9T9qjGmk-eZjGq1qptmBMA_RpQXNjvIoZXdpvh7j5vzBtmMN51p1o7uTsAv8XNUI5EF_Aw7dfmrYcZZj6zd2Dw34m4W7urKbvbk0QjwX_dvwRXbgR9CxHOclmxCQf_9cItMtmFLbjKp9m8nzZ6I0WGtHtytMgDT8OwqS3kRpGgAmq0VohK8orb1hos7efPaVUbNKB9d-_6bkptEo_pgsl0GyiY8rNiFhi3LMEFhw')`,
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-br from-slate-100/80 to-slate-200/80 dark:from-slate-800/80 dark:to-slate-900/80" />
            <div className="absolute inset-0 bg-white/10 dark:bg-black/10 backdrop-blur-[1px]" />
          </div>

          {/* Features */}
          <div className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-8 text-left">
            <div className="flex flex-col gap-2">
              <FileText className="h-8 w-8 text-primary" aria-hidden />
              <h3 className="font-semibold text-slate-900 dark:text-white">
                Multiple Resumes
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Tailor your CV for every specific role instantly.
              </p>
            </div>
            <div className="flex flex-col gap-2">
              <LayoutGrid className="h-8 w-8 text-primary" aria-hidden />
              <h3 className="font-semibold text-slate-900 dark:text-white">
                Visual Pipeline
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                See exactly where you are in the hiring process.
              </p>
            </div>
            <div className="flex flex-col gap-2">
              <BarChart3 className="h-8 w-8 text-primary" aria-hidden />
              <h3 className="font-semibold text-slate-900 dark:text-white">
                Smart Insights
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Track response rates and interview performance.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-auto py-12 px-6 flex flex-col items-center border-t border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-4 text-sm text-slate-500 dark:text-slate-400">
          <Link href="/privacy" className="hover:text-primary transition-colors">
            Privacy
          </Link>
          <span className="text-slate-300 dark:text-slate-700">·</span>
          <Link href="/terms" className="hover:text-primary transition-colors">
            Terms
          </Link>
          <span className="text-slate-300 dark:text-slate-700">·</span>
          <a href="mailto:support@careerkit.app" className="hover:text-primary transition-colors">
            Contact
          </a>
        </div>
        <div className="mt-4 text-xs text-slate-400 dark:text-slate-500">
          © {new Date().getFullYear()} CareerKit. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
