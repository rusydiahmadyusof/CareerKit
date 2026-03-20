import { Search } from "lucide-react";
import type { ApplicationStatus } from "@/lib/types/database";

export function ApplicationsFiltersBar({
  statuses,
  statusFilter,
  searchQ,
}: {
  statuses: ApplicationStatus[];
  statusFilter?: string;
  searchQ?: string;
}) {
  return (
    <form
      method="get"
      action="/applications"
      className="mb-8 flex flex-wrap items-center gap-4"
    >
      <div className="flex min-w-[180px] items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
          Status
        </span>
        <select
          name="status"
          defaultValue={statusFilter ?? ""}
          className="w-full cursor-pointer border-none bg-transparent text-sm text-slate-700 focus:ring-0"
        >
          <option value="">All statuses</option>
          {statuses.map((s) => (
            <option key={s} value={s}>
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </option>
          ))}
        </select>
      </div>

      <div className="relative min-w-[240px] flex-1">
        <Search
          className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400"
          aria-hidden
        />
        <input
          type="search"
          name="q"
          placeholder="Search company or role..."
          defaultValue={searchQ ?? ""}
          className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-10 pr-4 text-sm focus:border-primary focus:ring-primary"
        />
      </div>

      <button
        type="submit"
        className="rounded-xl bg-slate-200 px-5 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-300"
      >
        Apply Filters
      </button>
    </form>
  );
}

