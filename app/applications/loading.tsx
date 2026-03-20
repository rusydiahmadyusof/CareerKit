import { Skeleton } from "@/components/ui/skeleton";

export default function ApplicationsLoading() {
  return (
    <>
      <header className="mb-8 flex items-center justify-between">
        <div>
          <Skeleton className="h-8 w-36" />
          <Skeleton className="mt-2 h-4 w-56" />
        </div>
        <Skeleton className="h-10 w-40 rounded-xl" />
      </header>
      <div className="mb-8 flex flex-wrap items-center gap-4">
        <Skeleton className="h-12 w-[180px] rounded-xl" />
        <Skeleton className="h-12 min-w-[240px] flex-1 rounded-xl" />
        <Skeleton className="h-10 w-28 rounded-xl" />
      </div>
      <div className="space-y-0 overflow-hidden rounded-xl border border-slate-200 bg-white">
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className="flex items-center justify-between border-b border-slate-100 px-6 py-4 last:border-b-0"
          >
            <div className="flex flex-col gap-1">
              <Skeleton className="h-4 w-44" />
              <Skeleton className="h-3 w-28" />
            </div>
            <Skeleton className="h-6 w-20 rounded-full" />
          </div>
        ))}
      </div>
    </>
  );
}
