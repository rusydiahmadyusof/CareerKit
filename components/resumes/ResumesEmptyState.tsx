import Link from "next/link";
import { FileText } from "lucide-react";

export function ResumesEmptyState() {
  return (
    <section
      className="flex flex-col items-center justify-center rounded-lg border border-dashed border-slate-300 bg-white p-12 text-center"
      data-purpose="empty-state"
    >
      <div className="mb-4 rounded-full bg-slate-50 p-4">
        <FileText className="h-12 w-12 text-slate-300" aria-hidden />
      </div>
      <h3 className="text-lg font-semibold text-slate-900">No resumes yet</h3>
      <p className="mx-auto mt-1 mb-6 max-w-sm text-sm text-slate-500">
        Create your first resume to get started. Build multiple versions and export to PDF.
      </p>
      <Link
        href="/resumes/tailor"
        className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-6 py-2 text-sm font-medium text-white transition-colors hover:bg-primary/90"
      >
        <FileText className="h-4 w-4" aria-hidden />
        Create resume
      </Link>
    </section>
  );
}

