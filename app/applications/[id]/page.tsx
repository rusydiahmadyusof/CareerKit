import { createClient } from "@/lib/supabase/server";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { formatShortDate } from "@/lib/format-date";
import { updateApplicationAction } from "@/lib/actions/applications";
import { ApplicationFormEnhancements } from "../application-form-enhancements";
import { DeleteApplicationForm } from "./delete-application-form";
import { ErrorBanner } from "@/components/error-banner";
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
  "w-full rounded-md border border-slate-300 text-sm focus:border-slate-500 focus:ring-1 focus:ring-slate-500 focus:outline-none";
const labelClass = "block text-sm font-medium text-slate-700 mb-2";

export default async function ApplicationDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string; resume_id?: string }>;
}) {
  const { id } = await params;
  const { error: errorParam, resume_id: resumeIdParam } = await searchParams;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user && resumeIdParam?.trim()) {
    const resumeId = resumeIdParam.trim();
    const { data: resume } = await supabase
      .from("resumes")
      .select("id")
      .eq("id", resumeId)
      .eq("user_id", user.id)
      .single();
    if (resume) {
      const { error: updateError } = await supabase
        .from("applications")
        .update({ resume_id: resumeId })
        .eq("id", id)
        .eq("user_id", user.id);
      if (!updateError) {
        redirect(`/applications/${id}`);
      }
    }
  }

  const [
    { data: application },
    { data: resumes },
  ] = await Promise.all([
    supabase.from("applications").select("*").eq("id", id).single(),
    supabase.from("resumes").select("id, name").order("updated_at", { ascending: false }),
  ]);

  if (!application) notFound();

  const appliedAtValue = application.applied_at
    ? (() => {
        const d = new Date(application.applied_at);
        const pad = (n: number) => String(n).padStart(2, "0");
        return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
      })()
    : "";
  const statusLabel = application.status.charAt(0).toUpperCase() + application.status.slice(1);
  const appliedLabel = application.applied_at
    ? `Applied ${formatShortDate(application.applied_at)}`
    : "Not applied yet";

  return (
    <div className="flex w-full flex-col items-start overflow-y-auto">
      <header
        className="mb-6 flex w-full items-start justify-between"
        data-purpose="page-header"
      >
        <div>
          <h1 className="text-[24px] font-semibold leading-tight text-slate-900">
            {application.role} at {application.company}
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            {statusLabel}
            {application.applied_at && ` · ${appliedLabel}`}
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Link
            href={`/resumes/tailor?application_id=${application.id}`}
            className="text-sm font-medium text-slate-600 underline underline-offset-4 decoration-slate-300 transition-colors hover:text-slate-900"
            data-purpose="tailor-resume-link"
          >
            Create tailored resume for this job
          </Link>
          <Link
            href="/applications"
            className="text-sm font-medium text-slate-600 underline underline-offset-4 decoration-slate-300 transition-colors hover:text-slate-900"
          >
            Back to list
          </Link>
        </div>
      </header>

      {errorParam && (
        <div className="mb-6">
          <ErrorBanner message={decodeURIComponent(errorParam)} />
        </div>
      )}

      <div
        className="w-full max-w-[480px] rounded-[8px] border border-slate-200 bg-white p-6 shadow-sm"
        data-purpose="application-form-card"
      >
        <form
          action={updateApplicationAction}
          className="space-y-4"
        >
          <ApplicationFormEnhancements defaultAppliedAt={appliedAtValue} />
          <input type="hidden" name="id" value={application.id} />
          <div data-purpose="form-field">
            <label className={labelClass} htmlFor="company">
              Company *
            </label>
            <input
              id="company"
              name="company"
              type="text"
              required
              defaultValue={application.company}
              className={inputClass}
            />
          </div>
          <div data-purpose="form-field">
            <label className={labelClass} htmlFor="role">
              Role *
            </label>
            <input
              id="role"
              name="role"
              type="text"
              required
              defaultValue={application.role}
              className={inputClass}
            />
          </div>
          <div data-purpose="form-field">
            <label className={labelClass} htmlFor="status">
              Status
            </label>
            <select
              id="status"
              name="status"
              className={inputClass}
              defaultValue={application.status}
            >
              {STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s.charAt(0).toUpperCase() + s.slice(1)}
                </option>
              ))}
            </select>
          </div>
          <div data-purpose="form-field">
            <label className={labelClass} htmlFor="resume_id">
              Linked resume
            </label>
            <select
              id="resume_id"
              name="resume_id"
              className={inputClass}
              defaultValue={application.resume_id ?? ""}
            >
              <option value="">No resume linked</option>
              {resumes?.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name}
                </option>
              ))}
            </select>
            <p className="mt-1 text-xs text-slate-500">Changing the linked resume will update Role from that resume.</p>
          </div>
          <div data-purpose="form-field">
            <label className={labelClass} htmlFor="job_url">
              Job URL
            </label>
            <input
              id="job_url"
              name="job_url"
              type="url"
              defaultValue={application.job_url ?? ""}
              className={inputClass}
            />
          </div>
          <div data-purpose="form-field">
            <label className={labelClass} htmlFor="applied_at">
              Applied date & time
            </label>
            <input
              id="applied_at"
              name="applied_at"
              type="datetime-local"
              defaultValue={appliedAtValue}
              className={inputClass}
            />
          </div>
          <div data-purpose="form-field">
            <label className={labelClass} htmlFor="notes">
              Notes
            </label>
            <textarea
              id="notes"
              name="notes"
              rows={4}
              placeholder="Add any details about the interview process, contacts, etc."
              defaultValue={application.notes ?? ""}
              className={`${inputClass} min-h-[80px] py-2`}
            />
          </div>
          <div className="flex items-center gap-3 pt-4" data-purpose="form-actions">
            <button
              type="submit"
              className="rounded-md bg-slate-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-slate-700"
            >
              Save changes
            </button>
            <Link
              href="/applications"
              className="rounded-md border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50"
            >
              Cancel
            </Link>
          </div>
        </form>
        <div
          className="mt-4 border-t border-slate-100 pt-8"
          data-purpose="destructive-zone"
        >
          <DeleteApplicationForm id={application.id} />
          <p className="mt-2 text-xs text-slate-400">
            You&apos;ll be asked to confirm before deleting.
          </p>
        </div>
      </div>
    </div>
  );
}
