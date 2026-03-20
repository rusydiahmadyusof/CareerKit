import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardLoading() {
  return (
    <div className="space-y-6">
      <header>
        <Skeleton className="h-8 w-48" />
        <Skeleton className="mt-2 h-4 w-72" />
      </header>

      <section className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-24 rounded-lg" />
        ))}
      </section>

      <section>
        <Skeleton className="mb-3 h-4 w-28" />
        <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="flex h-12 items-center justify-between border-b border-slate-50 px-6 last:border-b-0"
            >
              <div className="flex gap-3">
                <Skeleton className="h-4 w-4 rounded" />
                <Skeleton className="h-4 w-40" />
              </div>
              <Skeleton className="h-3 w-16" />
            </div>
          ))}
        </div>
      </section>

      <section>
        <div className="flex flex-wrap gap-3">
          <Skeleton className="h-10 w-36" />
          <Skeleton className="h-10 w-40" />
        </div>
      </section>
    </div>
  );
}
