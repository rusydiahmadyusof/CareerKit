"use client";

import Link from "next/link";
import { formatAppliedDateAndDays } from "@/lib/format-date";
import { ApplicationRowActions } from "./application-row-actions";
import { ApplicationRowStatus } from "./application-row-status";
import type { ApplicationStatus } from "@/lib/types/database";

export type ApplicationRowItem = {
  id: string;
  company: string;
  role: string;
  status: string;
  updated_at: string;
  applied_at: string | null;
  resume_id: string | null;
  // Supabase relationship selects as an array, even for a single related resume.
  resumes: { name: string }[] | null;
};

export function ApplicationRow({ a }: { a: ApplicationRowItem }) {
  const resumeName = a.resumes?.[0]?.name;

  return (
    <div
      className="flex h-16 items-center justify-between border-b border-slate-100 px-6 transition-colors last:border-b-0 hover:bg-slate-50"
      data-purpose="application-row"
    >
      <Link
        href={`/applications/${a.id}`}
        className="flex flex-col min-w-0 flex-1 outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-inset rounded"
      >
        <span className="text-sm font-medium text-slate-900">{a.role}</span>
        <span className="text-xs text-slate-500">at {a.company}</span>
      </Link>
      <div className="flex shrink-0 items-center gap-6">
        <div className="hidden flex-col items-end md:flex">
          {resumeName ? (
            <>
              <span className="text-[11px] font-semibold uppercase text-slate-400">
                Resume
              </span>
              {a.resume_id ? (
                <Link
                  href={`/resumes/${a.resume_id}`}
                  className="text-xs text-slate-600 underline underline-offset-2 hover:text-slate-900"
                >
                  {resumeName}
                </Link>
              ) : (
                <span className="text-xs text-slate-600 underline-offset-2">
                  {resumeName}
                </span>
              )}
            </>
          ) : (
            <span className="text-xs text-slate-400">—</span>
          )}
        </div>
        <span className="whitespace-nowrap text-xs text-slate-400">
          {formatAppliedDateAndDays(a.applied_at, a.updated_at)}
        </span>
        <ApplicationRowStatus id={a.id} status={a.status as ApplicationStatus} />
        <ApplicationRowActions id={a.id} />
      </div>
    </div>
  );
}
