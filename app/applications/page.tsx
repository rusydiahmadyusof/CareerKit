import { requireOnboardedUser } from "@/lib/auth/guards";
import Link from "next/link";
import { ApplicationRow } from "./application-row";
import type { ApplicationRowItem } from "./application-row";
import { ErrorBanner } from "@/components/error-banner";
import { Plus } from "lucide-react";
import type { ApplicationStatus } from "@/lib/types/database";
import { ApplicationsFiltersBar } from "@/components/applications/ApplicationsFiltersBar";
import { ApplicationsEmptyState } from "@/components/applications/ApplicationsEmptyState";
import { fetchApplicationsPageForUser } from "@/lib/data/applications-search";

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
  searchParams: Promise<{ status?: string; q?: string; page?: string }>;
}) {
  const { status: statusFilter, q: searchQ, page: pageParam } = await searchParams;
  const PAGE_SIZE = 10;
  const page = Math.max(1, Number(pageParam ?? 1));
  const user = await requireOnboardedUser();

  const from = (page - 1) * PAGE_SIZE;

  const statusParam =
    statusFilter && STATUSES.includes(statusFilter as ApplicationStatus) ? statusFilter : null;
  const qParam = searchQ && searchQ.trim() ? searchQ.trim() : null;

  let rpcError: { message: string } | null = null;
  let totalCount = 0;
  let applications: any[] = [];
  try {
    const result = await fetchApplicationsPageForUser({
      userId: user.id,
      status: statusParam as ApplicationStatus | null,
      search: qParam,
      page,
      pageSize: PAGE_SIZE,
    });
    totalCount = result.total;
    applications = result.rows;
  } catch (error) {
    rpcError = { message: error instanceof Error ? error.message : "Failed to load applications." };
  }

  const list: ApplicationRowItem[] = (applications ?? []).map((a: any) => ({
    id: a.id,
    company: a.company,
    role: a.role,
    status: a.status,
    applied_at: a.applied_at ?? null,
    updated_at: a.updated_at,
    resume_id: a.resume_id ?? null,
    // Keep shape compatible with existing row renderer.
    resumes: a.resume_name ? [{ name: a.resume_name }] : null,
  }));

  const total = rpcError ? list.length : totalCount;

  function buildPageHref(nextPage: number) {
    const params = new URLSearchParams();
    if (statusFilter && STATUSES.includes(statusFilter as ApplicationStatus)) {
      params.set("status", statusFilter);
    }
    if (searchQ && searchQ.trim()) {
      params.set("q", searchQ);
    }
    // Always include page; filter/search submissions omit it so it naturally resets.
    params.set("page", String(nextPage));
    return `/applications?${params.toString()}`;
  }

  const start = total === 0 ? 0 : list.length > 0 ? from + 1 : total;
  const end = total === 0 ? 0 : list.length > 0 ? from + list.length : total;
  const canGoPrev = page > 1;
  const canGoNext = end < total;

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
      {rpcError && (
        <div className="mb-6">
          <ErrorBanner message={rpcError.message} />
        </div>
      )}

      {!rpcError && !list.length ? (
        <ApplicationsEmptyState
          statusFilter={statusFilter}
          searchQ={searchQ}
        />
      ) : !rpcError && list.length > 0 ? (
        <>
          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm" data-purpose="applications-list">
            {list.map((a) => (
              <ApplicationRow key={a.id} a={a} />
            ))}
          </div>

          <div className="mt-6 flex items-center justify-between text-sm text-slate-500" data-purpose="pagination-footer">
            <p>
              Showing {start} to {end} of {total} application{total !== 1 ? "s" : ""}
            </p>
            <div className="flex items-center gap-2">
              {canGoPrev ? (
                <Link
                  href={buildPageHref(page - 1)}
                  className="rounded-lg border border-slate-200 p-2 transition-colors hover:bg-slate-50"
                  aria-label="Previous page"
                >
                  <span className="sr-only">Previous</span>
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </Link>
              ) : (
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
              )}

              {canGoNext ? (
                <Link
                  href={buildPageHref(page + 1)}
                  className="rounded-lg border border-slate-200 p-2 transition-colors hover:bg-slate-50"
                  aria-label="Next page"
                >
                  <span className="sr-only">Next</span>
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              ) : (
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
              )}
            </div>
          </div>
        </>
      ) : null}
    </>
  );
}