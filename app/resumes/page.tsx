import { requireOnboardedUser } from "@/lib/auth/guards";
import { query } from "@/lib/db";
import type { Resume } from "@/lib/types/database";
import { formatShortDate } from "@/lib/format-date";
import { ErrorBanner } from "@/components/error-banner";
import { ResumesHeader } from "@/components/resumes/ResumesHeader";
import { ResumesEmptyState } from "@/components/resumes/ResumesEmptyState";
import { ResumeListActions } from "./resume-list-actions";

const CIRCLE_SIZE = 44;
const STROKE = 4;
const R = (CIRCLE_SIZE - STROKE) / 2;
const CX = CIRCLE_SIZE / 2;
const CY = CIRCLE_SIZE / 2;
const CIRCUMFERENCE = 2 * Math.PI * R;

function ATSScoreCircle({ score }: { score: number }) {
  const clamped = Math.min(100, Math.max(0, Math.round(score)));
  const dash = (clamped / 100) * CIRCUMFERENCE;
  const color = clamped >= 70 ? "stroke-emerald-500" : clamped >= 50 ? "stroke-amber-500" : "stroke-slate-400";
  return (
    <svg
      width={CIRCLE_SIZE}
      height={CIRCLE_SIZE}
      viewBox={`0 0 ${CIRCLE_SIZE} ${CIRCLE_SIZE}`}
      className="shrink-0"
      aria-hidden
    >
      <circle
        cx={CX}
        cy={CY}
        r={R}
        fill="none"
        stroke="currentColor"
        strokeWidth={STROKE}
        className="text-slate-200"
      />
      <circle
        cx={CX}
        cy={CY}
        r={R}
        fill="none"
        strokeWidth={STROKE}
        strokeLinecap="round"
        className={color}
        strokeDasharray={`${dash} ${CIRCUMFERENCE}`}
        strokeDashoffset={0}
        transform={`rotate(-90 ${CX} ${CY})`}
      />
      <text
        x={CX}
        y={CY}
        textAnchor="middle"
        dominantBaseline="central"
        className="text-[11px] font-semibold fill-slate-700"
      >
        {clamped}
      </text>
    </svg>
  );
}

export default async function ResumesPage() {
  const user = await requireOnboardedUser();

  let resolvedResumes: Array<Pick<Resume, "id" | "name" | "updated_at"> & { last_ats_score?: number | null }> = [];
  let resolvedError: { message: string } | null = null;
  try {
    resolvedResumes = await query(
      "select id, name, updated_at, last_ats_score from resumes where user_id = $1 order by updated_at desc",
      [user.id]
    );
  } catch (error) {
    resolvedError = { message: error instanceof Error ? error.message : "Failed to load resumes" };
  }

  return (
    <div className="flex flex-col">
      {/* Page Header — matches Resumes HTML */}
      <ResumesHeader />

      {resolvedError && (
        <div className="mb-6">
          <ErrorBanner title="Could not load resumes" message={resolvedError.message} />
        </div>
      )}

      {/* Resume List Container */}
      {!resolvedError && !resolvedResumes?.length ? (
        <ResumesEmptyState />
      ) : !resolvedError && resolvedResumes?.length ? (
        <section className="space-y-4" data-purpose="resume-list">
          {resolvedResumes.map((r: Pick<Resume, "id" | "name" | "updated_at"> & { last_ats_score?: number | null }) => (
            <article
              key={r.id}
              className="flex items-center justify-between gap-4 rounded-lg border border-slate-200 bg-white p-4 px-6 shadow-sm transition-shadow hover:shadow-md"
            >
              <div className="flex flex-col gap-1 min-w-0 flex-1">
                <h3 className="text-base font-medium text-slate-900">{r.name}</h3>
                <div className="flex items-center gap-3 text-sm text-slate-500">
                  <span>PDF</span>
                  <span className="h-1 w-1 rounded-full bg-slate-300" aria-hidden />
                  <span>Last edited {formatShortDate(r.updated_at)}</span>
                </div>
              </div>
              {r.last_ats_score != null && (
                <div className="flex-shrink-0" title={`ATS match: ${r.last_ats_score}/100`}>
                  <ATSScoreCircle score={r.last_ats_score} />
                </div>
              )}
              <ResumeListActions id={r.id} />
            </article>
          ))}
        </section>
      ) : null}
    </div>
  );
}
