import Link from "next/link";
import { Briefcase, Plus } from "lucide-react";

export function ApplicationsEmptyState({
  statusFilter,
  searchQ,
}: {
  statusFilter?: string;
  searchQ?: string;
}) {
  const hasFilters = Boolean(statusFilter || searchQ);

  return (
    <section
      className="rounded-xl border border-dashed border-slate-300 bg-white p-12 text-center"
      data-purpose="empty-state"
    >
      <Briefcase className="mx-auto h-12 w-12 text-slate-400" aria-hidden />
      <h2 className="mt-4 text-lg font-semibold text-slate-900">
        No applications yet
      </h2>
      <p className="mx-auto mt-2 max-w-sm text-sm text-slate-500">
        {hasFilters
          ? "No applications match your filters."
          : "Get started by adding your first job application. We'll help you track every step from submission to offer."}
      </p>
      <div className="mt-6">
        {hasFilters ? (
          <Link
            href="/applications"
            className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Clear filters
          </Link>
        ) : (
          <Link
            href="/applications/new"
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-primary/90"
          >
            <Plus className="h-5 w-5" aria-hidden />
            New application
          </Link>
        )}
      </div>
    </section>
  );
}

