import { Skeleton } from "@/components/ui/skeleton";

export default function ResumesLoading() {
  return (
    <div className="flex flex-col">
      <header className="mb-8 flex items-center justify-between">
        <div className="space-y-1">
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-4 w-64" />
        </div>
        <Skeleton className="h-10 w-36 rounded-lg" />
      </header>
      <section className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="flex items-center justify-between gap-4 rounded-lg border border-slate-200 bg-white p-4 px-6"
          >
            <div className="flex flex-1 flex-col gap-2">
              <Skeleton className="h-4 w-48" />
              <Skeleton className="h-3 w-36" />
            </div>
            <Skeleton className="h-11 w-11 rounded-full" />
          </div>
        ))}
      </section>
    </div>
  );
}
