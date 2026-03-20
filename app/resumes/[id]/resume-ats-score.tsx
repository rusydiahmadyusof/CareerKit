"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { getATSScoreForResume } from "@/lib/actions/resumes";
import { Gauge, ChevronDown, ChevronUp } from "lucide-react";

const inputClass =
  "w-full h-10 px-3 rounded-md border border-slate-200 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none";
const textareaClass =
  "w-full p-3 rounded-md border border-slate-200 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none";
const sectionHeading = "text-sm font-bold uppercase tracking-wider text-slate-400";
const labelClass = "block text-sm font-medium text-slate-700 mb-2";

const DEBOUNCE_MS = 1200;
const MIN_DESCRIPTION_LENGTH = 80;

export function ResumeATSScore({
  resumeId,
  defaultJobRole,
  defaultJobDescription = "",
  onScoreResult,
  onLoadingChange,
}: {
  resumeId: string;
  defaultJobRole: string;
  defaultJobDescription?: string;
  /** Called with full result when computed; summary shows score + aspects */
  onScoreResult?: (result: {
    score: number;
    feedback: string;
    aspects?: { keywords: number; experience: number; skills: number };
  }) => void;
  /** Called when loading state changes; summary can show "Scoring…" */
  onLoadingChange?: (loading: boolean) => void;
}) {
  const [jobRole, setJobRole] = useState(defaultJobRole);
  const [jobDescription, setJobDescription] = useState(defaultJobDescription);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    score: number;
    feedback: string;
    aspects?: { keywords: number; experience: number; skills: number };
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const runIdRef = useRef(0);
  const onScoreResultRef = useRef(onScoreResult);
  const onLoadingChangeRef = useRef(onLoadingChange);
  onScoreResultRef.current = onScoreResult;
  onLoadingChangeRef.current = onLoadingChange;

  const hasInitialJob = defaultJobDescription.trim().length >= MIN_DESCRIPTION_LENGTH;
  const [showDifferentJobForm, setShowDifferentJobForm] = useState(!hasInitialJob);

  const runScore = useCallback(async (role: string, description: string) => {
    const id = ++runIdRef.current;
    setLoading(true);
    setError(null);
    onLoadingChangeRef.current?.(true);
    const out = await getATSScoreForResume(resumeId, role, description);
    if (id !== runIdRef.current) {
      onLoadingChangeRef.current?.(false);
      return;
    }
    setLoading(false);
    onLoadingChangeRef.current?.(false);
    if ("error" in out) {
      setError(out.error);
      setResult(null);
      return;
    }
    const payload = {
      score: out.score,
      feedback: out.feedback,
      ...(out.aspects && { aspects: out.aspects }),
    };
    setResult(payload);
    onScoreResultRef.current?.(payload);
  }, [resumeId]);

  // Run once on load when we have a stored job, so the summary at top shows a score
  const initialJobRan = useRef(false);
  useEffect(() => {
    const desc = defaultJobDescription.trim();
    if (desc.length < MIN_DESCRIPTION_LENGTH) return;
    if (initialJobRan.current) return;
    initialJobRan.current = true;
    const role = (defaultJobRole || "Role").trim();
    runScore(role, desc);
  }, [runScore, defaultJobRole, defaultJobDescription]);

  useEffect(() => {
    const trimmed = jobDescription.trim();
    if (trimmed.length < MIN_DESCRIPTION_LENGTH) return;

    const t = setTimeout(() => {
      runScore(jobRole.trim() || "Role", trimmed);
    }, DEBOUNCE_MS);

    return () => clearTimeout(t);
  }, [runScore, jobRole, jobDescription]);

  async function handleScore() {
    if (!jobDescription.trim()) return;
    await runScore(jobRole, jobDescription.trim());
  }

  return (
    <div className="space-y-4 border-t border-slate-200 pt-6">
      <h3 className={sectionHeading}>
        <span className="flex items-center gap-2">
          <Gauge className="h-4 w-4 text-slate-400" aria-hidden />
          ATS match score
        </span>
      </h3>

      {hasInitialJob && !showDifferentJobForm ? (
        <>
          <p className="text-xs text-slate-500">
            This resume was created for the job below. Score uses your saved resume.
          </p>
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm text-slate-600">
              Matched to: <span className="font-medium text-slate-800">{jobRole || "—"}</span>
            </span>
            <button
              type="button"
              disabled={loading || !jobDescription.trim()}
              onClick={handleScore}
              className="rounded-md bg-slate-700 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-slate-800 disabled:opacity-50 disabled:pointer-events-none"
            >
              {loading ? "Scoring…" : "Get ATS score"}
            </button>
            <button
              type="button"
              onClick={() => setShowDifferentJobForm(true)}
              className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700"
            >
              Score against a different job
              <ChevronDown className="h-4 w-4" />
            </button>
          </div>
        </>
      ) : (
        <>
          <p className="text-xs text-slate-500">
            Paste a job description to see how well this resume matches (AI-based estimate). Uses your saved resume.
          </p>
          {hasInitialJob && (
            <button
              type="button"
              onClick={() => setShowDifferentJobForm(false)}
              className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700"
            >
              Use original job for this resume
              <ChevronUp className="h-4 w-4" />
            </button>
          )}
          <div>
            <label className={labelClass} htmlFor="ats-job-role">
              Job role / title
            </label>
            <input
              id="ats-job-role"
              type="text"
              value={jobRole}
              onChange={(e) => setJobRole(e.target.value)}
              placeholder="e.g. Senior Frontend Developer"
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass} htmlFor="ats-job-description">
              Job description
            </label>
            <textarea
              id="ats-job-description"
              rows={4}
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder="Paste the job posting text here..."
              className={textareaClass}
            />
          </div>
          <button
            type="button"
            disabled={loading || !jobDescription.trim()}
            onClick={handleScore}
            className="rounded-md bg-slate-700 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-slate-800 disabled:opacity-50 disabled:pointer-events-none"
          >
            {loading ? "Scoring…" : "Get ATS score"}
          </button>
        </>
      )}

      {error && (
        <p className="text-sm text-red-600" role="alert">
          {error}
        </p>
      )}
      {result && (
        <div className="space-y-2 rounded-md border border-slate-200 bg-slate-50 p-4">
          <p className="text-sm font-semibold text-slate-800">
            Score: <span className="text-slate-900">{result.score}/100</span>
          </p>
          <p className="whitespace-pre-wrap text-sm text-slate-600">{result.feedback}</p>
        </div>
      )}
    </div>
  );
}
