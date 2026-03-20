import Link from "next/link";
import { Briefcase, Calendar, FileText } from "lucide-react";

export function DashboardSummaryCards({
  resumeCount,
  activeApplicationCount,
  interviewCount,
}: {
  resumeCount: number;
  activeApplicationCount: number;
  interviewCount: number;
}) {
  return (
    <section className="mb-6 grid grid-cols-1 gap-6 md:grid-cols-3">
      <Link
        href="/resumes"
        className="flex items-start gap-4 rounded-lg border border-slate-200 bg-white p-6 shadow-sm transition-colors hover:bg-slate-50/50"
      >
        <div className="rounded-lg bg-primary/10 p-3 text-primary">
          <FileText className="h-6 w-6" aria-hidden />
        </div>
        <div>
          <p className="text-sm font-medium text-muted-foreground">Total Resumes</p>
          <p className="mt-1 text-3xl font-bold text-slate-900">{resumeCount}</p>
        </div>
      </Link>

      <Link
        href="/applications"
        className="flex items-start gap-4 rounded-lg border border-slate-200 bg-white p-6 shadow-sm transition-colors hover:bg-slate-50/50"
      >
        <div className="rounded-lg bg-emerald-50 p-3 text-emerald-600">
          <Briefcase className="h-6 w-6" aria-hidden />
        </div>
        <div>
          <p className="text-sm font-medium text-muted-foreground">Active Applications</p>
          <p className="mt-1 text-3xl font-bold text-slate-900">{activeApplicationCount}</p>
        </div>
      </Link>

      <Link
        href="/applications?status=interviewing"
        className="flex items-start gap-4 rounded-lg border border-slate-200 bg-white p-6 shadow-sm transition-colors hover:bg-slate-50/50"
      >
        <div className="rounded-lg bg-orange-50 p-3 text-orange-600">
          <Calendar className="h-6 w-6" aria-hidden />
        </div>
        <div>
          <p className="text-sm font-medium text-muted-foreground">Interviews</p>
          <p className="mt-1 text-3xl font-bold text-slate-900">{interviewCount}</p>
        </div>
      </Link>
    </section>
  );
}

