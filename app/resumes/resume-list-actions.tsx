"use client";

import Link from "next/link";
import { useRef } from "react";
import { Eye, Copy, Download, Trash2 } from "lucide-react";
import { duplicateResumeAction, deleteResumeAction } from "@/lib/actions/resumes";

export function ResumeListActions({ id }: { id: string }) {
  const deleteFormRef = useRef<HTMLFormElement>(null);

  function handleDeleteClick(e: React.MouseEvent) {
    e.preventDefault();
    if (!confirm("Delete this resume? This cannot be undone.")) return;
    deleteFormRef.current?.requestSubmit();
  }

  return (
    <div className="flex items-center gap-2" data-purpose="action-buttons">
      <Link
        href={`/resumes/${id}`}
        className="rounded-md p-2 text-slate-400 transition-colors hover:bg-slate-50 hover:text-slate-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        title="View"
        aria-label="View resume"
      >
        <Eye className="h-5 w-5" aria-hidden />
      </Link>
      <form action={duplicateResumeAction} className="inline-block">
        <input type="hidden" name="id" value={id} />
        <button
          type="submit"
          className="rounded-md p-2 text-slate-400 transition-colors hover:bg-slate-50 hover:text-slate-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          title="Duplicate"
          aria-label="Duplicate resume"
        >
          <Copy className="h-5 w-5" aria-hidden />
        </button>
      </form>
      <Link
        href={`/resumes/${id}/print`}
        target="_blank"
        rel="noopener noreferrer"
        className="rounded-md p-2 text-slate-400 transition-colors hover:bg-slate-50 hover:text-slate-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        title="Download"
        aria-label="Open print view to download PDF"
      >
        <Download className="h-5 w-5" aria-hidden />
      </Link>
      <form ref={deleteFormRef} action={deleteResumeAction} className="inline-block">
        <input type="hidden" name="id" value={id} />
        <button
          type="button"
          onClick={handleDeleteClick}
          className="rounded-md p-2 text-slate-400 transition-colors hover:bg-red-50 hover:text-red-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          title="Delete"
          aria-label="Delete resume"
        >
          <Trash2 className="h-5 w-5" aria-hidden />
        </button>
      </form>
    </div>
  );
}
