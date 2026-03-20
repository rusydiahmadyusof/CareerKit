import { createClient } from "@/lib/supabase/server";
import { Suspense } from "react";
import Link from "next/link";
import { formatTimeAgo } from "@/lib/format-date";
import { AuthSuccessBanner } from "./auth-success-banner";
import { ErrorBanner } from "@/components/error-banner";
import { DashboardSummaryCards } from "@/components/dashboard/DashboardSummaryCards";
import { RecentActivityList } from "@/components/dashboard/RecentActivityList";
import {
  FileText,
  Briefcase,
  RefreshCw,
  Send,
  PlusCircle,
  CheckCircle2,
  Plus,
} from "lucide-react";
import type { Resume, Application } from "@/lib/types/database";

const ACTIVE_APPLICATION_STATUSES = ["applied", "screening", "interviewing"] as const;

export default async function DashboardPage() {
  const supabase = await createClient();

  let resumeCount = 0;
  let activeApplicationCount = 0;
  let interviewCount = 0;
  let recentResumes: Pick<Resume, "id" | "name" | "updated_at">[] = [];
  let recentApplications: Pick<Application, "id" | "company" | "role" | "status" | "updated_at">[] = [];
  let dataError: string | null = null;

  try {
    const [
      resumesCountRes,
      activeCountRes,
      interviewCountRes,
      recentResumesRes,
      recentApplicationsRes,
    ] = await Promise.all([
      supabase.from("resumes").select("*", { count: "exact", head: true }),
      supabase
        .from("applications")
        .select("*", { count: "exact", head: true })
        .in("status", ACTIVE_APPLICATION_STATUSES),
      supabase
        .from("applications")
        .select("*", { count: "exact", head: true })
        .eq("status", "interviewing"),
      supabase
        .from("resumes")
        .select("id, name, updated_at")
        .order("updated_at", { ascending: false })
        .limit(5),
      supabase
        .from("applications")
        .select("id, company, role, status, updated_at")
        .order("updated_at", { ascending: false })
        .limit(5),
    ]);

    if (!resumesCountRes.error) resumeCount = resumesCountRes.count ?? 0;
    else dataError = resumesCountRes.error.message;
    if (!activeCountRes.error) activeApplicationCount = activeCountRes.count ?? 0;
    else dataError = dataError ?? activeCountRes.error.message;
    if (!interviewCountRes.error) interviewCount = interviewCountRes.count ?? 0;
    else dataError = dataError ?? interviewCountRes.error.message;
    if (!recentResumesRes.error) recentResumes = recentResumesRes.data ?? [];
    else dataError = dataError ?? recentResumesRes.error.message;
    if (!recentApplicationsRes.error) recentApplications = recentApplicationsRes.data ?? [];
    else dataError = dataError ?? recentApplicationsRes.error.message;
  } catch (err) {
    dataError = err instanceof Error ? err.message : "Failed to load dashboard";
  }

  const hasResumes = resumeCount > 0;
  const hasApplications = recentApplications.length > 0;
  const isEmpty = !hasResumes && !hasApplications;

  const recentActivityItems = buildRecentActivity(recentResumes, recentApplications);

  return (
    <div>
      <Suspense fallback={null}>
        <AuthSuccessBanner />
      </Suspense>

      {dataError && (
        <div className="mb-6">
          <ErrorBanner title="Could not load dashboard" message={dataError} />
        </div>
      )}

      {/* Page Header — Professional Dashboard */}
      <header className="mb-6">
        <h1 className="text-2xl font-semibold text-slate-900">Dashboard</h1>
        <p className="mt-1 text-sm text-muted-foreground">Overview of your resumes and applications</p>
      </header>

      <DashboardSummaryCards
        resumeCount={resumeCount}
        activeApplicationCount={activeApplicationCount}
        interviewCount={interviewCount}
      />

      {/* Recent Activity — simple list, border-b border-slate-50, h-12 */}
      <section className="mb-6">
        <h2 className="mb-3 px-1 text-sm font-medium text-slate-700">Recent activity</h2>
        <RecentActivityList items={recentActivityItems} />
      </section>

      {/* Quick Actions — Create resume, New application */}
      <section>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/resumes/tailor"
            className="inline-flex items-center justify-center gap-2 rounded-md bg-primary px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
          >
            <Plus className="h-[18px] w-[18px]" aria-hidden />
            Create resume
          </Link>
          <Link
            href="/applications/new"
            className="inline-flex items-center justify-center gap-2 rounded-md border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition-colors hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-100 focus:ring-offset-2"
          >
            <Briefcase className="h-[18px] w-[18px] text-muted-foreground" aria-hidden />
            New application
          </Link>
        </div>
      </section>

      {/* Empty State — when no data */}
      {isEmpty && (
        <section
          className="mt-12 flex flex-col items-center rounded-lg border border-dashed border-slate-300 bg-white p-12 text-center"
          data-purpose="empty-state"
          aria-label="Get started"
        >
          <div className="mb-4 rounded-full bg-slate-50 p-4">
            <FileText className="h-12 w-12 text-slate-300" aria-hidden />
          </div>
          <h3 className="text-lg font-semibold text-slate-900">Get started</h3>
          <p className="mt-1 mb-6 max-w-sm text-sm text-muted-foreground">
            Create your first resume or add a job application to track your progress.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/resumes/tailor"
              className="inline-flex items-center justify-center rounded-md bg-primary px-6 py-2 text-sm font-medium text-white transition-colors hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
            >
              Create resume
            </Link>
            <Link
              href="/applications/new"
              className="inline-flex items-center justify-center gap-2 rounded-md border border-slate-200 bg-white px-6 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-200 focus:ring-offset-2"
            >
              <Briefcase className="h-4 w-4" aria-hidden />
              New application
            </Link>
          </div>
        </section>
      )}
    </div>
  );
}

type ActivityItem = {
  id: string;
  href: string;
  title: React.ReactNode;
  time: string;
  icon: React.ReactNode;
  sortAt: string;
};

function buildRecentActivity(
  resumes: Pick<Resume, "id" | "name" | "updated_at">[],
  applications: Pick<Application, "id" | "company" | "role" | "status" | "updated_at">[]
): ActivityItem[] {
  const items: ActivityItem[] = [];
  resumes.forEach((r) => {
    items.push({
      id: `resume-${r.id}`,
      href: `/resumes/${r.id}`,
      title: (
        <>
          Resume <strong className="font-medium text-slate-900">&apos;{r.name}&apos;</strong> updated
        </>
      ),
      time: formatTimeAgo(r.updated_at),
      icon: <RefreshCw className="h-[18px] w-[18px]" />,
      sortAt: r.updated_at,
    });
  });
  applications.forEach((a) => {
    const isScreening = a.status === "screening";
    const isApplied = a.status === "applied";
    const isInterview = a.status === "interviewing";
    items.push({
      id: `app-${a.id}`,
      href: `/applications/${a.id}`,
      title: isInterview ? (
        <>
          Application at <strong className="font-medium text-slate-900">{a.company}</strong> – Interview
        </>
      ) : isScreening ? (
        <>
          Application at <strong className="font-medium text-slate-900">{a.company}</strong> – Screening
        </>
      ) : isApplied ? (
        <>
          Applied to <strong className="font-medium text-slate-900">{a.company}</strong>
        </>
      ) : (
        <>
          Application at <strong className="font-medium text-slate-900">{a.company}</strong> – {a.status}
        </>
      ),
      time: formatTimeAgo(a.updated_at),
      icon: isInterview ? (
        <CheckCircle2 className="h-[18px] w-[18px]" />
      ) : isScreening ? (
        <Send className="h-[18px] w-[18px]" />
      ) : isApplied ? (
        <CheckCircle2 className="h-[18px] w-[18px]" />
      ) : (
        <PlusCircle className="h-[18px] w-[18px]" />
      ),
      sortAt: a.updated_at,
    });
  });
  items.sort((a, b) => (a.sortAt > b.sortAt ? -1 : 1));
  return items.slice(0, 5);
}
