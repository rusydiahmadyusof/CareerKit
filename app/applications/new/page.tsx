import { createClient } from "@/lib/supabase/server";
import { createApplication } from "@/lib/actions/applications";
import Link from "next/link";
import { ApplicationFormEnhancements } from "../application-form-enhancements";
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

const inputClass =
  "block w-full rounded-md border border-slate-300 text-sm shadow-sm focus:border-slate-500 focus:ring-1 focus:ring-slate-500 focus:outline-none";
const labelClass = "text-sm font-medium text-slate-700";

export default async function NewApplicationPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const supabase = await createClient();
  const { data: resumes } = await supabase
    .from("resumes")
    .select("id, name")
    .order("updated_at", { ascending: false });

  return (
    <>
      <header className="mb-8" data-purpose="page-title-section">
        <h1 className="text-2xl font-semibold text-slate-900">New application</h1>
        <p className="mt-1 text-sm text-slate-500">Add a job application to track.</p>
      </header>

      {error && (
        <p className="mb-6 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800" role="alert">
          {decodeURIComponent(error)}
        </p>
      )}

      <section
        className="max-w-[480px] rounded-lg border border-slate-200 bg-white p-6 shadow-sm"
        data-purpose="form-container"
      >
        <form action={createApplication} className="space-y-4">
          <ApplicationFormEnhancements />
          <div className="flex flex-col gap-2">
            <label className={labelClass} htmlFor="company">
              Company *
            </label>
            <input
              id="company"
              name="company"
              type="text"
              required
              placeholder="e.g. Acme Corp"
              className={inputClass}
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className={labelClass} htmlFor="role">
              Role *
            </label>
            <input
              id="role"
              name="role"
              type="text"
              required
              placeholder="e.g. Senior Frontend Developer"
              className={inputClass}
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className={labelClass} htmlFor="status">
              Status
            </label>
            <select id="status" name="status" className={inputClass}>
              {STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s.charAt(0).toUpperCase() + s.slice(1)}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-2">
            <label className={labelClass} htmlFor="job_url">
              Job URL
            </label>
            <input
              id="job_url"
              name="job_url"
              type="url"
              placeholder="https://..."
              className={inputClass}
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className={labelClass} htmlFor="resume_id">
              Linked resume
            </label>
            <select id="resume_id" name="resume_id" className={inputClass}>
              <option value="">No resume linked</option>
              {resumes?.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name}
                </option>
              ))}
            </select>
            <p className="text-xs text-slate-500">Selecting a resume will fill Role from that resume.</p>
          </div>
          <div className="flex flex-col gap-2">
            <label className={labelClass} htmlFor="applied_at">
              Applied date & time
            </label>
            <input
              id="applied_at"
              name="applied_at"
              type="datetime-local"
              className={inputClass}
            />
            <p className="text-xs text-slate-500">Defaults to now; you can change it.</p>
          </div>
          <div className="flex flex-col gap-2">
            <label className={labelClass} htmlFor="notes">
              Notes
            </label>
            <textarea
              id="notes"
              name="notes"
              rows={3}
              placeholder="Add any details about the interview process..."
              className={`${inputClass} py-2`}
            />
          </div>
          <div
            className="mt-6 flex items-center gap-3 border-t border-slate-100 pt-4"
            data-purpose="form-actions"
          >
            <button
              type="submit"
              className="rounded-md bg-slate-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-slate-700"
            >
              Add application
            </button>
            <Link
              href="/applications"
              className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
            >
              Cancel
            </Link>
          </div>
        </form>
      </section>
    </>
  );
}
