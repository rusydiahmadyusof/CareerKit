"use client";

import { useRouter } from "next/navigation";
import { updateApplicationStatus } from "@/lib/actions/applications";
import { cn } from "@/lib/utils";
import type { ApplicationStatus } from "@/lib/types/database";

const STATUSES: ApplicationStatus[] = [
  "saved",
  "applied",
  "screening",
  "interviewing",
  "offer",
  "rejected",
  "withdrawn",
];

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
  saved: "bg-slate-100 text-slate-600 border-slate-200",
  applied: "bg-slate-100 text-slate-600 border-slate-200",
  screening: "bg-blue-50 text-blue-600 border-blue-100",
  interviewing: "bg-orange-50 text-orange-600 border-orange-100",
  offer: "bg-green-50 text-green-600 border-green-100",
  rejected: "bg-red-50 text-red-600 border-red-100",
  withdrawn: "bg-slate-100 text-slate-600 border-slate-200",
};

export function ApplicationRowStatus({
  id,
  status,
}: {
  id: string;
  status: ApplicationStatus;
}) {
  const router = useRouter();

  async function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const value = e.target.value as ApplicationStatus;
    if (!STATUSES.includes(value)) return;
    e.stopPropagation();
    const result = await updateApplicationStatus(id, value);
    if (result.error) return;
    router.refresh();
  }

  return (
    <select
      value={status}
      onChange={handleChange}
      onClick={(e) => e.stopPropagation()}
      className={cn(
        "cursor-pointer appearance-none rounded-full border px-2.5 py-1 pr-7 text-xs font-semibold outline-none focus:ring-2 focus:ring-primary/20",
        statusPillClass[status]
      )}
      style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`,
        backgroundRepeat: "no-repeat",
        backgroundPosition: "right 6px center",
      }}
      aria-label="Change status"
    >
      {STATUSES.map((s) => (
        <option key={s} value={s}>
          {statusLabels[s]}
        </option>
      ))}
    </select>
  );
}
