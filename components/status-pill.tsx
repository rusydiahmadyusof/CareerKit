import { cn } from "@/lib/utils";
import type { ApplicationStatus } from "@/lib/types/database";

const statusLabels: Record<ApplicationStatus, string> = {
  saved: "Saved",
  applied: "Applied",
  screening: "Screening",
  interviewing: "Interviewing",
  offer: "Offer",
  rejected: "Rejected",
  withdrawn: "Withdrawn",
};

const statusPillClass: Record<ApplicationStatus, string> = {
  saved: "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700",
  applied: "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700",
  screening: "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border-blue-100 dark:border-blue-800",
  interviewing: "bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 border-orange-100 dark:border-orange-800",
  offer: "bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 border-green-100 dark:border-green-800",
  rejected: "bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border-red-100 dark:border-red-800",
  withdrawn: "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700",
};

export function StatusPill({
  status,
  className,
  variant = "default",
}: {
  status: ApplicationStatus;
  className?: string;
  variant?: "default" | "applications-list";
}) {
  const useDesignVariant = variant === "applications-list";
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold border",
        useDesignVariant ? statusPillClass[status] : "bg-muted text-muted-foreground",
        className
      )}
      aria-label={`Status: ${statusLabels[status]}`}
    >
      {statusLabels[status]}
    </span>
  );
}
