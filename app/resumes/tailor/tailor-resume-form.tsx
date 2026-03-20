"use client";

import Link from "next/link";
import { useFormStatus } from "react-dom";
import { tailorResume } from "@/lib/actions/resumes";

const inputClass =
  "flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50";
const textareaClass =
  "flex min-h-[120px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50";
const selectClass =
  "flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-8 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
    >
      {pending ? "Generating…" : "Generate resume"}
    </button>
  );
}

export function TailorResumeForm({
  resumes,
  initialJobTitle = "",
  initialJobDescription = "",
  applicationId,
}: {
  resumes: { id: string; name: string }[];
  initialJobTitle?: string;
  initialJobDescription?: string;
  applicationId?: string;
}) {
  return (
    <form action={tailorResume} className="space-y-4">
      {applicationId && (
        <input type="hidden" name="application_id" value={applicationId} />
      )}
      <div className="space-y-1.5">
        <label className="text-sm font-medium" htmlFor="job-title">
          Job title
        </label>
        <input
          className={inputClass}
          id="job-title"
          name="job-title"
          type="text"
          placeholder="e.g. Senior Software Engineer"
          defaultValue={initialJobTitle}
        />
      </div>

      <div className="space-y-1.5">
        <label className="text-sm font-medium" htmlFor="job-description">
          Job description
        </label>
        <textarea
          className={textareaClass}
          id="job-description"
          name="job-description"
          rows={8}
          placeholder="Paste the job description here"
          defaultValue={initialJobDescription}
        />
      </div>

      <div className="space-y-1.5">
        <label className="text-sm font-medium" htmlFor="base-resume">
          Base resume
        </label>
        <select
          className={selectClass}
          id="base-resume"
          name="base-resume"
        >
          <option value="scratch">From scratch</option>
          {resumes.map((r) => (
            <option key={r.id} value={r.id}>
              {r.name || "Untitled"}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-3 pt-2">
        <div className="flex items-center gap-3">
          <SubmitButton />
          <Link
            href="/resumes"
            className="inline-flex h-10 items-center justify-center rounded-md border border-input bg-transparent px-8 text-sm font-medium shadow-sm transition-colors hover:bg-muted hover:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          >
            Cancel
          </Link>
        </div>
        <p
          className="text-[12px] leading-relaxed text-muted-foreground"
          data-purpose="form-helper-text"
        >
          Generated content will open in the editor where you can edit and export.
        </p>
      </div>
    </form>
  );
}
