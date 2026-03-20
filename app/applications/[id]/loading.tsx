import { Skeleton } from "@/components/ui/skeleton";

export default function ApplicationDetailLoading() {
  return (
    <div className="flex w-full flex-col space-y-6">
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-10 w-24 rounded-md" />
      </div>

      <div className="rounded-lg border border-slate-200 bg-white p-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Skeleton className="mb-2 h-4 w-20" />
            <Skeleton className="h-10 w-full" />
          </div>
          <div>
            <Skeleton className="mb-2 h-4 w-16" />
            <Skeleton className="h-10 w-full" />
          </div>
          <div className="sm:col-span-2">
            <Skeleton className="mb-2 h-4 w-24" />
            <Skeleton className="h-10 w-full" />
          </div>
          <div>
            <Skeleton className="mb-2 h-4 w-20" />
            <Skeleton className="h-10 w-32" />
          </div>
          <div className="sm:col-span-2">
            <Skeleton className="mb-2 h-4 w-28" />
            <Skeleton className="h-24 w-full" />
          </div>
        </div>
      </div>

      <Skeleton className="h-10 w-28 rounded-md" />
    </div>
  );
}
