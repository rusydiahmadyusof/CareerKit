import { Skeleton } from "@/components/ui/skeleton";

export default function ResumeDetailLoading() {
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <Skeleton className="h-9 w-48" />
        <div className="flex gap-2">
          <Skeleton className="h-9 w-24 rounded-md" />
          <Skeleton className="h-9 w-24 rounded-md" />
        </div>
      </div>

      <div className="flex gap-4 rounded-lg border border-slate-200 bg-white p-4">
        <Skeleton className="h-10 w-10 shrink-0 rounded" />
        <div className="flex flex-1 flex-wrap items-center gap-3">
          <Skeleton className="h-6 w-16" />
          <Skeleton className="h-6 w-20" />
          <Skeleton className="h-6 w-24" />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-4">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-24 w-full rounded-md" />
          <Skeleton className="h-6 w-28" />
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <Skeleton key={i} className="h-20 w-full rounded-md" />
            ))}
          </div>
        </div>
        <Skeleton className="min-h-[400px] rounded-lg border border-slate-200" />
      </div>
    </div>
  );
}
