import Link from "next/link";
import { FileText } from "lucide-react";

export function ResumesHeader() {
  return (
    <header
      className="mb-8 flex items-center justify-between"
      data-purpose="page-header"
    >
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold text-slate-900">Resumes</h1>
        <p className="text-sm text-slate-500">
          Create and manage your professional resumes.
        </p>
      </div>
      <Link
        href="/resumes/tailor"
        className="flex h-10 items-center gap-2 rounded-lg bg-primary px-4 font-medium text-white transition-colors hover:bg-primary/90"
      >
        <FileText className="h-4 w-4" aria-hidden />
        <span>Create resume</span>
      </Link>
    </header>
  );
}

