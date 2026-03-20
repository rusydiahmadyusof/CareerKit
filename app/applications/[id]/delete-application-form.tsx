"use client";

import { useRef } from "react";
import { deleteApplication } from "@/lib/actions/applications";
import { Trash2 } from "lucide-react";

export function DeleteApplicationForm({ id }: { id: string }) {
  const formRef = useRef<HTMLFormElement>(null);

  function handleClick(e: React.MouseEvent) {
    e.preventDefault();
    if (!confirm("Delete this application? This cannot be undone.")) return;
    formRef.current?.requestSubmit();
  }

  return (
    <form ref={formRef} action={deleteApplication} className="inline-block">
      <input type="hidden" name="id" value={id} />
      <button
        type="button"
        onClick={handleClick}
        className="flex items-center gap-2 text-sm font-medium text-red-600 transition-colors hover:text-red-700"
      >
        <Trash2 className="h-4 w-4" aria-hidden />
        Delete application
      </button>
    </form>
  );
}
