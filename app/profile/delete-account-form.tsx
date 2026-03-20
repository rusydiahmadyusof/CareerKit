"use client";

import { useState } from "react";
import { deleteAccount } from "@/lib/actions/auth";

export function DeleteAccountForm() {
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (confirm !== "delete my account") {
      setError('Type "delete my account" to confirm.');
      return;
    }
    setError(null);
    setLoading(true);
    const result = await deleteAccount();
    setLoading(false);
    if (result?.error) {
      setError(result.error);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-10 border-t border-slate-200 pt-8">
      <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-500">
        Danger zone
      </h2>
      <p className="mt-2 text-sm text-slate-600">
        Permanently delete your account and all your data (profile, resumes, applications). This cannot be undone.
      </p>
      <div className="mt-4 flex flex-wrap items-end gap-3">
        <label htmlFor="delete-confirm" className="sr-only">
          Type &quot;delete my account&quot; to confirm
        </label>
        <input
          id="delete-confirm"
          type="text"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          placeholder='Type "delete my account" to confirm'
          className="h-10 min-w-[220px] rounded-md border border-slate-200 px-3 text-sm focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none"
          disabled={loading}
        />
        <button
          type="submit"
          disabled={loading || confirm.toLowerCase() !== "delete my account"}
          className="h-10 rounded-md border border-red-200 bg-red-50 px-4 text-sm font-medium text-red-700 transition-colors hover:bg-red-100 disabled:opacity-50 disabled:hover:bg-red-50"
        >
          {loading ? "Deleting…" : "Delete my account"}
        </button>
      </div>
      {error && (
        <p className="mt-2 text-sm text-red-600" role="alert">
          {error}
        </p>
      )}
    </form>
  );
}
