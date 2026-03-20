import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { ApplicationRow } from "./application-row";
import { ErrorBanner } from "@/components/error-banner";
import { Plus } from "lucide-react";
import type { ApplicationStatus } from "@/lib/types/database";
import { ApplicationsFiltersBar } from "@/components/applications/ApplicationsFiltersBar";
import { ApplicationsEmptyState } from "@/components/applications/ApplicationsEmptyState";

const STATUSES: ApplicationStatus[] = [
  "saved",
  "applied",
  "screening",
  "interviewing",
  "offer",
  "rejected",
  "withdrawn",
];

export default async function ApplicationsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; q?: string }>;
}) {
  const { status: statusFilter, q: searchQ } = await searchParams;
  const supabase = await createClient();

  let query = supabase
    .from("applications")
    .select("id, company, role, status, applied_at, updated_at, resume_id, resumes(name)")
    .order("updated_at", { ascending: false });

  if (statusFilter && STATUSES.includes(statusFilter as ApplicationStatus)) {
    query = query.eq("status", statusFilter);
  }
  if (searchQ && searchQ.trim()) {
    const escaped = searchQ
      .trim()
      .replace(/\\/g, "\\\\")
      .replace(/%/g, "\\%")
      .replace(/_/g, "\\_");
    query = query.or(
      `company.ilike.%${escaped}%,role.ilike.%${escaped}%`
    );
  }

  const { data: applications, error } = await query;
  const list = applications ?? [];
  const total = list.length;

  return (
    <>
      <header className="mb-8 flex items-center justify-between" data-purpose="page-header">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">
            Applications
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Track your job applications and recruitment status.
          </p>
        </div>
        <Link
          href="/applications/new"
          className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-primary/90"
        >
          <Plus className="h-5 w-5" aria-hidden />
          New application
        </Link>
      </header>

      <ApplicationsFiltersBar
        statuses={STATUSES}
        statusFilter={statusFilter}
        searchQ={searchQ}
      />

      {/* Applications List */}
      {error && (
        <div className="mb-6">
          <ErrorBanner message={error.message} />
        </div>
      )}

      {!error && !list.length ? (
        <ApplicationsEmptyState
          statusFilter={statusFilter}
          searchQ={searchQ}
        />
      ) : !error && list.length > 0 ? (
        <>
          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm" data-purpose="applications-list">
            {list.map((a) => (
              <ApplicationRow key={a.id} a={a} />
            ))}
          </div>

          <div className="mt-6 flex items-center justify-between text-sm text-slate-500" data-purpose="pagination-footer">
            <p>
              Showing 1 to {total} of {total} application{total !== 1 ? "s" : ""}
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                className="rounded-lg border border-slate-200 p-2 transition-colors hover:bg-slate-50 disabled:opacity-50"
                disabled
                aria-label="Previous page"
              >
                <span className="sr-only">Previous</span>
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button
                type="button"
                className="rounded-lg border border-slate-200 p-2 transition-colors hover:bg-slate-50 disabled:opacity-50"
                disabled
                aria-label="Next page"
              >
                <span className="sr-only">Next</span>
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        </>
      ) : null}
    </>
  );
}